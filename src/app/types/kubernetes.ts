export interface NodeCondition {
  type: string;
  status: string;
  lastHeartbeatTime: string;
  lastTransitionTime: string;
  reason: string;
  message: string;
}

export interface NodeStatus {
  conditions: NodeCondition[];
  capacity: {
    cpu: string;
    memory: string;
    pods: string;
  };
  allocatable: {
    cpu: string;
    memory: string;
    pods: string;
  };
}

export interface Node {
  metadata: {
    name: string;
    uid: string;
    creationTimestamp: string;
    labels: Record<string, string>;
  };
  status: NodeStatus;
}

export interface NodeMetrics {
  apiVersion: string;
  items: Array<{
    metadata: {
      name: string;
      [key: string]: any; /* eslint-disable-line @typescript-eslint/no-explicit-any */
    };
    usage: {
      cpu: string;
      memory: string;
    };
    timestamp: string;
    window: string;
  }>;
  kind: string;
}

export interface ContainerState {
  waiting?: {
    reason: string;
    message: string;
  };
  running?: {
    startedAt: string;
  };
  terminated?: {
    exitCode: number;
    reason: string;
    message: string;
    startedAt: string;
    finishedAt: string;
  };
}

export interface ContainerStatus {
  name: string;
  state: ContainerState;
  lastState: ContainerState;
  ready: boolean;
  restartCount: number;
  image: string;
  imageID: string;
  containerID: string;
}

export interface PodStatus {
  phase: 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Unknown';
  conditions: Array<{
    type: string;
    status: string;
    lastProbeTime: string;
    lastTransitionTime: string;
  }>;
  hostIP: string;
  podIP: string;
  startTime: string;
  containerStatuses: ContainerStatus[];
}

export interface Pod {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    labels: Record<string, string>;
  };
  spec: {
    nodeName: string;
    containers: Array<{
      name: string;
      image: string;
      ports: Array<{
        containerPort: number;
        protocol: string;
      }>;
      resources: {
        requests?: {
          cpu?: string;
          memory?: string;
        };
        limits?: {
          cpu?: string;
          memory?: string;
        };
      };
    }>;
  };
  status: PodStatus;
}
