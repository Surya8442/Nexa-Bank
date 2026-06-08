pipeline {
    agent any

    environment {
        APP_NAME = "nexabank"
        DOCKER_IMAGE = "nexabank-app"
        IMAGE_TAG = "${BUILD_NUMBER}"

        AWS_REGION = "ap-south-1"
        ECR_REPO = "028282962975.dkr.ecr.ap-south-1.amazonaws.com/nexa"

        EC2_USER = "ec2-user"
        EC2_HOST = "http://15.206.72.246"
        SSH_KEY = "/var/lib/jenkins/usekey.pem"

        SONAR_SCANNER = "/opt/sonar-scanner/bin/sonar-scanner"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Surya8442/Nexa-Bank.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint Check') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    withCredentials([string(credentialsId: 'sonar-cred', variable: 'SONAR_TOKEN')]) {
                        sh """
                        ${SONAR_SCANNER} \
                          -Dsonar.projectKey=nexa-bank \
                          -Dsonar.projectName=NexaBank \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://13.206.185.241:9000 \
                          -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} ."
            }
        }

        stage('Docker Tag') {
            steps {
                sh "docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}"
            }
        }

        stage('AWS ECR Login') {
            steps {
                sh """
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login --username AWS --password-stdin ${ECR_REPO}
                """
            }
        }

        stage('Push to ECR') {
            steps {
                sh "docker push ${ECR_REPO}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh """
                ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} '
                docker pull ${ECR_REPO}:${IMAGE_TAG} &&
                docker stop nexabank || true &&
                docker rm nexabank || true &&
                docker run -d --name nexabank -p 80:3000 ${ECR_REPO}:${IMAGE_TAG}
                '
                """
            }
        }
    }

    post {
        success {
            echo "🚀 NexaBank Deployment Successful!"
        }
        failure {
            echo "❌ Pipeline Failed - Check Logs"
        }
    }
}
