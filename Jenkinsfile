pipeline {
    agent any

    environment {
        APP_NAME      = "nexabank"
        IMAGE_TAG     = "${BUILD_NUMBER}"

        AWS_REGION    = "ap-south-1"
        ECR_REPO      = "public.ecr.aws/e9o7j9u4/nexa"

        EC2_USER      = "ec2-user"
        EC2_HOST      = "65.0.55.170"

        SONAR_SCANNER = "/opt/sonar-scanner/bin/sonar-scanner"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'git_cred',
                    url: 'https://github.com/Surya8442/Nexa-Bank.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh """
                npm ci
                """
            }
        }

        stage('Lint & Test') {
            steps {
                sh """
                npm run lint || true
                npm test || true
                """
            }
        }

        stage('Build App') {
            steps {
                sh """
                npm run build
                """
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    withCredentials([
                        string(credentialsId: 'sonar-cred', variable: 'SONAR_TOKEN')
                    ]) {
                        sh """
                        ${SONAR_SCANNER} \
                        -Dsonar.projectKey=nexa-bank \
                        -Dsonar.projectName=NexaBank \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube:9000 \
                        -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                docker build -t ${APP_NAME}:${IMAGE_TAG} .
                """
            }
        }

        stage('Docker Tag') {
            steps {
                sh """
                docker tag ${APP_NAME}:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}
                docker tag ${APP_NAME}:${IMAGE_TAG} ${ECR_REPO}:latest
                """
            }
        }

        stage('ECR Login') {
            steps {
                sh """
                aws ecr-public get-login-password \
                --region ${AWS_REGION} | \
                docker login --username AWS --password-stdin public.ecr.aws
                """
            }
        }

        stage('Push to ECR') {
            steps {
                sh """
                docker push ${ECR_REPO}:${IMAGE_TAG}
                docker push ${ECR_REPO}:latest
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'EOF'

                    set -e

                    echo "Pulling latest image..."
                    docker pull ${ECR_REPO}:${IMAGE_TAG}

                    echo "Backing up current container..."
                    docker tag ${ECR_REPO}:latest ${ECR_REPO}:backup || true

                    echo "Stopping old container..."
                    docker stop nexabank || true
                    docker rm nexabank || true

                    echo "Starting new container..."
                    docker run -d \
                        --name nexabank \
                        --restart unless-stopped \
                        -p 3000:3000 \
                        ${ECR_REPO}:${IMAGE_TAG}

                    echo "Waiting for health check..."
                    sleep 10

                    curl -f http://localhost:3000 || exit 1

                    echo "Deployment successful"

                    EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment Successful"
        }

        failure {
            echo "❌ Deployment Failed - Check logs"
        }

        always {
            cleanWs()
        }
    }
}
