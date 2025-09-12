import { K8sClient } from '../utils/k8sClient'
import { App } from '../types/app'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

export class ProvisioningService {
  private static k8sClient = new K8sClient()

  static async provisionApp(app: App): Promise<void> {
    try {
      logger.info(`Starting provisioning for app ${app.id}`)

      // Create namespace if it doesn't exist
      await this.createNamespace(app.namespace)

      // Create deployment
      await this.createDeployment(app)

      // Create service
      await this.createService(app)

      // Create ingress if needed
      if (app.port) {
        await this.createIngress(app)
      }

      logger.info(`App ${app.id} provisioned successfully`)
    } catch (error) {
      logger.error(`Failed to provision app ${app.id}:`, error)
      throw error
    }
  }

  static async terminateApp(app: App): Promise<void> {
    try {
      logger.info(`Terminating app ${app.id}`)

      // Delete ingress
      if (app.kubernetesConfig?.ingressName) {
        await this.k8sClient.deleteIngress(
          app.kubernetesConfig.ingressName,
          app.namespace
        )
      }

      // Delete service
      if (app.kubernetesConfig?.serviceName) {
        await this.k8sClient.deleteService(
          app.kubernetesConfig.serviceName,
          app.namespace
        )
      }

      // Delete deployment
      if (app.kubernetesConfig?.deploymentName) {
        await this.k8sClient.deleteDeployment(
          app.kubernetesConfig.deploymentName,
          app.namespace
        )
      }

      // Delete namespace (this will clean up all resources)
      await this.k8sClient.deleteNamespace(app.namespace)

      logger.info(`App ${app.id} terminated successfully`)
    } catch (error) {
      logger.error(`Failed to terminate app ${app.id}:`, error)
      throw error
    }
  }

  private static async createNamespace(namespace: string): Promise<void> {
    const namespaceManifest = {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: namespace,
        labels: {
          'vibecaas.com/managed': 'true'
        }
      }
    }

    await this.k8sClient.createNamespace(namespaceManifest)
  }

  private static async createDeployment(app: App): Promise<void> {
    const deploymentName = `app-${app.id}`
    const labels = {
      'app': app.name,
      'app-id': app.id,
      'user-id': app.userId,
      'vibecaas.com/managed': 'true'
    }

    const deploymentManifest = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: deploymentName,
        namespace: app.namespace,
        labels
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            'app-id': app.id
          }
        },
        template: {
          metadata: {
            labels
          },
          spec: {
            containers: [{
              name: app.name,
              image: app.image,
              ports: [{
                containerPort: app.port,
                name: 'http'
              }],
              resources: {
                requests: {
                  cpu: app.resources.cpu,
                  memory: app.resources.memory
                },
                limits: {
                  cpu: app.resources.cpu,
                  memory: app.resources.memory
                }
              },
              env: Object.entries(app.environment).map(([key, value]) => ({
                name: key,
                value: value
              })),
              volumeMounts: app.volumes.map(volume => ({
                name: volume.name,
                mountPath: volume.mountPath
              }))
            }],
            volumes: app.volumes.map(volume => ({
              name: volume.name,
              persistentVolumeClaim: {
                claimName: `${volume.name}-pvc`
              }
            }))
          }
        }
      }
    }

    await this.k8sClient.createDeployment(deploymentManifest, app.namespace)

    // Update app with deployment name
    app.kubernetesConfig = {
      ...app.kubernetesConfig,
      deploymentName
    }
  }

  private static async createService(app: App): Promise<void> {
    const serviceName = `app-${app.id}-service`
    const labels = {
      'app-id': app.id,
      'vibecaas.com/managed': 'true'
    }

    const serviceManifest = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: serviceName,
        namespace: app.namespace,
        labels
      },
      spec: {
        selector: {
          'app-id': app.id
        },
        ports: [{
          port: app.port,
          targetPort: app.port,
          name: 'http'
        }],
        type: 'ClusterIP'
      }
    }

    await this.k8sClient.createService(serviceManifest, app.namespace)

    // Update app with service name
    app.kubernetesConfig = {
      ...app.kubernetesConfig,
      serviceName
    }
  }

  private static async createIngress(app: App): Promise<void> {
    const ingressName = `app-${app.id}-ingress`
    const hostname = `${app.id}.vibecaas.local`

    const ingressManifest = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: ingressName,
        namespace: app.namespace,
        annotations: {
          'nginx.ingress.kubernetes.io/rewrite-target': '/',
          'cert-manager.io/cluster-issuer': 'letsencrypt-prod'
        }
      },
      spec: {
        rules: [{
          host: hostname,
          http: {
            paths: [{
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: `app-${app.id}-service`,
                  port: {
                    number: app.port
                  }
                }
              }
            }]
          }
        }],
        tls: [{
          hosts: [hostname],
          secretName: `${app.id}-tls`
        }]
      }
    }

    await this.k8sClient.createIngress(ingressManifest, app.namespace)

    // Update app with ingress name and URL
    app.kubernetesConfig = {
      ...app.kubernetesConfig,
      ingressName
    }
    app.url = `https://${hostname}`
  }
}