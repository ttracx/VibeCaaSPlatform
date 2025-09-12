import * as k8s from '@kubernetes/client-node'
import { logger } from './logger'

export class K8sClient {
  private kc: k8s.KubeConfig
  private k8sApi: k8s.CoreV1Api
  private appsV1Api: k8s.AppsV1Api
  private networkingV1Api: k8s.NetworkingV1Api
  private metricsApi: k8s.MetricsV1beta1Api

  constructor() {
    this.kc = new k8s.KubeConfig()
    
    // Try to load from cluster first, then fallback to local config
    try {
      this.kc.loadFromCluster()
    } catch (error) {
      logger.warn('Failed to load from cluster, trying local config:', error)
      try {
        this.kc.loadFromDefault()
      } catch (localError) {
        logger.error('Failed to load Kubernetes config:', localError)
        throw new Error('Unable to load Kubernetes configuration')
      }
    }

    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api)
    this.appsV1Api = this.kc.makeApiClient(k8s.AppsV1Api)
    this.networkingV1Api = this.kc.makeApiClient(k8s.NetworkingV1Api)
    this.metricsApi = this.kc.makeApiClient(k8s.MetricsV1beta1Api)
  }

  // Namespace operations
  async createNamespace(manifest: any): Promise<void> {
    try {
      await this.k8sApi.createNamespace(manifest)
      logger.info(`Namespace ${manifest.metadata.name} created`)
    } catch (error) {
      logger.error(`Failed to create namespace ${manifest.metadata.name}:`, error)
      throw error
    }
  }

  async deleteNamespace(name: string): Promise<void> {
    try {
      await this.k8sApi.deleteNamespace(name)
      logger.info(`Namespace ${name} deleted`)
    } catch (error) {
      logger.error(`Failed to delete namespace ${name}:`, error)
      throw error
    }
  }

  // Deployment operations
  async createDeployment(manifest: any, namespace: string): Promise<void> {
    try {
      await this.appsV1Api.createNamespacedDeployment(namespace, manifest)
      logger.info(`Deployment ${manifest.metadata.name} created in ${namespace}`)
    } catch (error) {
      logger.error(`Failed to create deployment ${manifest.metadata.name}:`, error)
      throw error
    }
  }

  async updateDeployment(name: string, namespace: string, manifest: any): Promise<void> {
    try {
      await this.appsV1Api.patchNamespacedDeployment(name, namespace, manifest)
      logger.info(`Deployment ${name} updated in ${namespace}`)
    } catch (error) {
      logger.error(`Failed to update deployment ${name}:`, error)
      throw error
    }
  }

  async deleteDeployment(name: string, namespace: string): Promise<void> {
    try {
      await this.appsV1Api.deleteNamespacedDeployment(name, namespace)
      logger.info(`Deployment ${name} deleted from ${namespace}`)
    } catch (error) {
      logger.error(`Failed to delete deployment ${name}:`, error)
      throw error
    }
  }

  async getDeployment(name: string, namespace: string): Promise<any> {
    try {
      const response = await this.appsV1Api.readNamespacedDeployment(name, namespace)
      return response.body
    } catch (error) {
      logger.error(`Failed to get deployment ${name}:`, error)
      return null
    }
  }

  async scaleDeployment(name: string, namespace: string, replicas: number): Promise<void> {
    try {
      const scale = {
        spec: {
          replicas
        }
      }
      await this.appsV1Api.patchNamespacedDeploymentScale(name, namespace, scale)
      logger.info(`Deployment ${name} scaled to ${replicas} replicas`)
    } catch (error) {
      logger.error(`Failed to scale deployment ${name}:`, error)
      throw error
    }
  }

  async restartDeployment(name: string, namespace: string): Promise<void> {
    try {
      const patch = {
        spec: {
          template: {
            metadata: {
              annotations: {
                'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
              }
            }
          }
        }
      }
      await this.appsV1Api.patchNamespacedDeployment(name, namespace, patch)
      logger.info(`Deployment ${name} restarted`)
    } catch (error) {
      logger.error(`Failed to restart deployment ${name}:`, error)
      throw error
    }
  }

  // Service operations
  async createService(manifest: any, namespace: string): Promise<void> {
    try {
      await this.k8sApi.createNamespacedService(namespace, manifest)
      logger.info(`Service ${manifest.metadata.name} created in ${namespace}`)
    } catch (error) {
      logger.error(`Failed to create service ${manifest.metadata.name}:`, error)
      throw error
    }
  }

  async deleteService(name: string, namespace: string): Promise<void> {
    try {
      await this.k8sApi.deleteNamespacedService(name, namespace)
      logger.info(`Service ${name} deleted from ${namespace}`)
    } catch (error) {
      logger.error(`Failed to delete service ${name}:`, error)
      throw error
    }
  }

  // Ingress operations
  async createIngress(manifest: any, namespace: string): Promise<void> {
    try {
      await this.networkingV1Api.createNamespacedIngress(namespace, manifest)
      logger.info(`Ingress ${manifest.metadata.name} created in ${namespace}`)
    } catch (error) {
      logger.error(`Failed to create ingress ${manifest.metadata.name}:`, error)
      throw error
    }
  }

  async deleteIngress(name: string, namespace: string): Promise<void> {
    try {
      await this.networkingV1Api.deleteNamespacedIngress(name, namespace)
      logger.info(`Ingress ${name} deleted from ${namespace}`)
    } catch (error) {
      logger.error(`Failed to delete ingress ${name}:`, error)
      throw error
    }
  }

  // Pod operations
  async getPods(namespace: string, labelSelector?: Record<string, string>): Promise<any[]> {
    try {
      const selector = labelSelector ? 
        Object.entries(labelSelector).map(([key, value]) => `${key}=${value}`).join(',') : 
        undefined

      const response = await this.k8sApi.listNamespacedPod(
        namespace,
        undefined, // pretty
        undefined, // allowWatchBookmarks
        undefined, // continue
        undefined, // fieldSelector
        selector
      )
      
      return response.body.items
    } catch (error) {
      logger.error(`Failed to get pods in ${namespace}:`, error)
      return []
    }
  }

  async getPodLogs(podName: string, namespace: string): Promise<string> {
    try {
      const response = await this.k8sApi.readNamespacedPodLog(podName, namespace)
      return response.body
    } catch (error) {
      logger.error(`Failed to get logs for pod ${podName}:`, error)
      return ''
    }
  }

  // Metrics operations
  async getPodMetrics(podName: string, namespace: string): Promise<any> {
    try {
      const response = await this.metricsApi.readNamespacedPodMetrics(podName, namespace)
      const metrics = response.body.containers?.[0]
      
      return {
        cpu: this.parseCpuUsage(metrics?.usage?.cpu || '0'),
        memory: this.parseMemoryUsage(metrics?.usage?.memory || '0'),
        networkIn: 0, // Not available in basic metrics
        networkOut: 0  // Not available in basic metrics
      }
    } catch (error) {
      logger.error(`Failed to get metrics for pod ${podName}:`, error)
      return {
        cpu: 0,
        memory: 0,
        networkIn: 0,
        networkOut: 0
      }
    }
  }

  private parseCpuUsage(cpuStr: string): number {
    // Convert CPU usage to millicores
    if (cpuStr.endsWith('n')) {
      return parseInt(cpuStr.replace('n', '')) / 1000000
    } else if (cpuStr.endsWith('u')) {
      return parseInt(cpuStr.replace('u', '')) / 1000
    } else if (cpuStr.endsWith('m')) {
      return parseInt(cpuStr.replace('m', ''))
    } else {
      return parseInt(cpuStr) * 1000
    }
  }

  private parseMemoryUsage(memoryStr: string): number {
    // Convert memory usage to bytes
    if (memoryStr.endsWith('Ki')) {
      return parseInt(memoryStr.replace('Ki', '')) * 1024
    } else if (memoryStr.endsWith('Mi')) {
      return parseInt(memoryStr.replace('Mi', '')) * 1024 * 1024
    } else if (memoryStr.endsWith('Gi')) {
      return parseInt(memoryStr.replace('Gi', '')) * 1024 * 1024 * 1024
    } else {
      return parseInt(memoryStr)
    }
  }
}