import { K8sClient } from '../utils/k8sClient'
import { App } from '../types/app'
import { logger } from '../utils/logger'

export class AppManagementService {
  private static k8sClient = new K8sClient()

  static async startApp(app: App): Promise<void> {
    try {
      if (!app.kubernetesConfig?.deploymentName) {
        throw new Error('App deployment not found')
      }

      // Scale deployment to 1 replica
      await this.k8sClient.scaleDeployment(
        app.kubernetesConfig.deploymentName,
        app.namespace,
        1
      )

      logger.info(`App ${app.id} started`)
    } catch (error) {
      logger.error(`Failed to start app ${app.id}:`, error)
      throw error
    }
  }

  static async stopApp(app: App): Promise<void> {
    try {
      if (!app.kubernetesConfig?.deploymentName) {
        throw new Error('App deployment not found')
      }

      // Scale deployment to 0 replicas
      await this.k8sClient.scaleDeployment(
        app.kubernetesConfig.deploymentName,
        app.namespace,
        0
      )

      logger.info(`App ${app.id} stopped`)
    } catch (error) {
      logger.error(`Failed to stop app ${app.id}:`, error)
      throw error
    }
  }

  static async restartApp(app: App): Promise<void> {
    try {
      if (!app.kubernetesConfig?.deploymentName) {
        throw new Error('App deployment not found')
      }

      // Restart deployment by updating annotation
      await this.k8sClient.restartDeployment(
        app.kubernetesConfig.deploymentName,
        app.namespace
      )

      logger.info(`App ${app.id} restarted`)
    } catch (error) {
      logger.error(`Failed to restart app ${app.id}:`, error)
      throw error
    }
  }

  static async updateApp(app: App): Promise<void> {
    try {
      if (!app.kubernetesConfig?.deploymentName) {
        throw new Error('App deployment not found')
      }

      // Update deployment with new configuration
      const deploymentManifest = {
        spec: {
          template: {
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
                }))
              }]
            }
          }
        }
      }

      await this.k8sClient.updateDeployment(
        app.kubernetesConfig.deploymentName,
        app.namespace,
        deploymentManifest
      )

      logger.info(`App ${app.id} updated`)
    } catch (error) {
      logger.error(`Failed to update app ${app.id}:`, error)
      throw error
    }
  }

  static async getAppLogs(app: App): Promise<string[]> {
    try {
      if (!app.kubernetesConfig?.deploymentName) {
        throw new Error('App deployment not found')
      }

      // Get pod name for the deployment
      const pods = await this.k8sClient.getPods(app.namespace, {
        'app-id': app.id
      })

      if (pods.length === 0) {
        return []
      }

      const podName = pods[0].metadata?.name
      if (!podName) {
        return []
      }

      // Get logs from the pod
      const logs = await this.k8sClient.getPodLogs(podName, app.namespace)
      
      // Update app with latest logs
      app.logs = logs.split('\n').filter(line => line.trim())
      app.kubernetesConfig = {
        ...app.kubernetesConfig,
        podName
      }

      return app.logs
    } catch (error) {
      logger.error(`Failed to get logs for app ${app.id}:`, error)
      return []
    }
  }

  static async getAppMetrics(app: App): Promise<App['metrics']> {
    try {
      if (!app.kubernetesConfig?.deploymentName) {
        throw new Error('App deployment not found')
      }

      // Get pod metrics
      const pods = await this.k8sClient.getPods(app.namespace, {
        'app-id': app.id
      })

      if (pods.length === 0) {
        return {
          cpu: 0,
          memory: 0,
          networkIn: 0,
          networkOut: 0
        }
      }

      const podName = pods[0].metadata?.name
      if (!podName) {
        return {
          cpu: 0,
          memory: 0,
          networkIn: 0,
          networkOut: 0
        }
      }

      // Get metrics from Kubernetes metrics API
      const metrics = await this.k8sClient.getPodMetrics(podName, app.namespace)
      
      // Update app with latest metrics
      app.metrics = metrics
      app.kubernetesConfig = {
        ...app.kubernetesConfig,
        podName
      }

      return metrics
    } catch (error) {
      logger.error(`Failed to get metrics for app ${app.id}:`, error)
      return {
        cpu: 0,
        memory: 0,
        networkIn: 0,
        networkOut: 0
      }
    }
  }

  static async getAppStatus(app: App): Promise<string> {
    try {
      if (!app.kubernetesConfig?.deploymentName) {
        return 'unknown'
      }

      const deployment = await this.k8sClient.getDeployment(
        app.kubernetesConfig.deploymentName,
        app.namespace
      )

      if (!deployment) {
        return 'not-found'
      }

      const replicas = deployment.spec?.replicas || 0
      const readyReplicas = deployment.status?.readyReplicas || 0

      if (replicas === 0) {
        return 'stopped'
      } else if (readyReplicas === replicas) {
        return 'running'
      } else if (readyReplicas > 0) {
        return 'building'
      } else {
        return 'creating'
      }
    } catch (error) {
      logger.error(`Failed to get status for app ${app.id}:`, error)
      return 'unknown'
    }
  }
}