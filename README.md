# 🛒 Shopping Cart App — Deployed on Kubernetes via KOPS

A Node.js shopping cart application deployed on a production-style Kubernetes cluster provisioned on AWS EC2 using KOPS. This project covers the full DevOps lifecycle: containerization, image registry, cluster provisioning, and application deployment.

---

## 🏗️ Architecture

```
Local Machine
     │
     │  docker build + push
     ▼
 DockerHub (sivyam/shopping-cart)
     │
     │  kubectl apply
     ▼
┌─────────────────────────────────────────┐
│         Kubernetes Cluster (KOPS)        │
│              on AWS EC2                  │
│                                         │
│  ┌──────────────────┐  ┌─────────────┐  │
│  │ Pod:             │  │ Pod:        │  │
│  │ shopping-cart    │◄─► mongo       │  │
│  │ (port 3000)      │  │ (port 27017)│  │
│  └────────┬─────────┘  └─────────────┘  │
│           │                             │
│  ┌────────▼─────────┐                   │
│  │ Service:         │                   │
│  │ NodePort / LB    │                   │
│  │ (external access)│                   │
│  └──────────────────┘                   │
└─────────────────────────────────────────┘
         │
         ▼
   Browser Access
   http://<NODE-IP>:<NodePort>
```

---

## ✅ Prerequisites

| Tool | Purpose |
|---|---|
| Docker | Build and push container image |
| DockerHub Account | Host the container image |
| AWS CLI | Interact with AWS services |
| KOPS | Provision Kubernetes cluster on EC2 |
| kubectl | Deploy and manage Kubernetes resources |
| S3 Bucket | KOPS state store |

---

## 🚀 Step-by-Step Execution

### Step 1 — Build & Push Docker Image to DockerHub

```bash
# Build the Docker image
docker build -t sivyam/shopping-cart:v1 .

# Login to DockerHub
docker login

# Push image to DockerHub
docker push sivyam/shopping-cart:v1
```

> ✅ Image is now available at: `docker.io/sivyam/shopping-cart:v1`

---

### Step 2 — Provision Kubernetes Cluster using KOPS on AWS EC2

```bash
# Export cluster name and S3 state store
export NAME=mycluster.k8s.local
export KOPS_STATE_STORE=s3://your-kops-state-bucket

# Create S3 bucket for KOPS state (skip if already exists)
aws s3api create-bucket \
  --bucket your-kops-state-bucket \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning \
  --bucket your-kops-state-bucket \
  --versioning-configuration Status=Enabled

# Create the cluster definition
kops create cluster \
  --name=$NAME \
  --state=$KOPS_STATE_STORE \
  --zones=ap-south-1a \
  --node-count=2 \
  --node-size=t3.medium \
  --master-size=t3.medium \
  --dns-zone=$NAME

# Provision the cluster on AWS EC2
kops update cluster --name=$NAME --yes --admin

# Wait for cluster to become healthy (~10 minutes)
kops validate cluster --wait 10m

# Confirm nodes are up and ready
kubectl get nodes
```

---

### Step 3 — Fetch Image from DockerHub

Kubernetes automatically pulls the image from DockerHub when the manifest is applied. To verify the image is reachable:

```bash
# Confirm image exists on DockerHub
docker pull sivyam/shopping-cart:v1

# After deployment, check image pull status on a pod
kubectl describe pod shopping-cart-app | grep -i image
```

> Kubernetes pulls `sivyam/shopping-cart:v1` from DockerHub at deploy time — no manual pull needed on cluster nodes.

---

### Step 4 — Deploy the App on Kubernetes

```bash
# Deploy both app and MongoDB pods
kubectl apply -f shopping-cart.yaml

# Verify pods are running
kubectl get pods

# Check pod details if anything looks off
kubectl describe pod shopping-cart-app
kubectl describe pod mongo

# Stream logs from the app pod
kubectl logs -f shopping-cart-app
```

Expected output:

```
NAME                  READY   STATUS    RESTARTS   AGE
shopping-cart-app     1/1     Running   0          1m
mongo                 1/1     Running   0          1m
```

---

### Step 5 — Access the Website via Kubernetes Service

```bash
# Forward the pod port to your local machine
kubectl port-forward pod/shopping-cart-app 3000:3000
```

Open your browser and go to:

```
http://localhost:3000
```

> **Using a NodePort Service?** Access via `http://<EC2-Node-Public-IP>:<NodePort>`
> **Using a LoadBalancer Service?** Get the external URL with `kubectl get svc`

---

## 🛠️ Useful Commands

```bash
# --- Pods & Services ---
kubectl get pods                           # List all pods
kubectl get svc                            # List all services
kubectl describe pod <pod-name>            # Debug pod events and config
kubectl logs -f <pod-name>                 # Live log stream
kubectl exec -it <pod-name> -- /bin/bash   # Open shell inside pod
kubectl delete -f shopping-cart.yaml       # Remove all deployed resources

# --- KOPS Cluster ---
kops validate cluster                      # Check cluster health
kops get cluster                           # List existing clusters
kops delete cluster --name=$NAME --yes     # Destroy cluster and EC2 instances
```

---

## ⚠️ Tear Down — Avoid AWS Charges

```bash
# Always delete the cluster when not in use
kops delete cluster --name=mycluster.k8s.local --yes
```

> KOPS provisions real EC2 instances — delete the cluster after use to stop billing.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the app listens on (`3000`) |
| `MONGO_DB_URL` | MongoDB connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

> ⚠️ Never commit `.env` to Git. Add it to `.gitignore`.
> For production, use **Kubernetes Secrets** instead of hardcoding env vars in manifests.

---

## 👤 Author

**Sivi** — Aspiring DevOps Engineer  
DockerHub: [hub.docker.com/u/sivyam](https://hub.docker.com/repository/docker/sivyam/shopping-cart/tags)

---

## 🙏 Original Application Credit

The Node.js shopping cart application used in this project was originally developed by **Ruslan Zharkov**. All credit for the application code belongs to the original author. This repository focuses solely on the DevOps implementation — containerization, CI/CD, and Kubernetes deployment — built on top of that foundation.

Original repository: [github.com/ruslanzharkov/nodejs-shopping-cart](https://github.com/ruslanzharkov/nodejs-shopping-cart?tab=readme-ov-file)