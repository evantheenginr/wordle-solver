pipeline {
    agent any
    /*
     * Run every day at a random minute at some hour between 9am and before 5pm New York time
     */
    triggers {
        cron('TZ=America/New_York
             H H(9-17) * * *')
    }
    tools {
        nodejs 'latest'
    }
    stages {
        stage('Bootstrap') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }
        stage('Solve Wordle of the Day') {
            steps {
                sh 'npm run today'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'results/*'
        }
    }
}
