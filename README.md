## Cloud Infrastructure Dashboard

A real-time monitoring dashboard for Kubernetes clusters. Built with React, TypeScript, and WebSocket integration for live updates. Features cost optimization insights and deployment tracking.


### Architecture Diagram

```mermaid
graph TD
    subgraph Frontend
        NC[Next.js Client]
        R[Redux Store]
        WS[WebSocket Client]
        VIZ[Visualization Components]
    end

    subgraph Backend
        API[Next.js API Routes]
        WSS[WebSocket Server]
        KI[Kubernetes Integration]
        CA[Cost Analysis Service]
    end

    subgraph Data Sources
        MK[Minikube Cluster]
        MS[Metrics Server]
        CD[Custom Data Collectors]
    end

    NC --> R
    NC --> WS
    NC --> VIZ
    
    WS --> WSS
    API --> KI
    API --> CA
    
    KI --> MK
    KI --> MS
    CA --> CD
    
    WSS --> KI
    WSS --> CA
```