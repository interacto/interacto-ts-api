def githubStatusCheck(String state, String description){
    def commitHash = checkout(scm).GIT_COMMIT
    githubNotify account: 'interacto',sha: "${commitHash}", status: state, description: description, credentialsId: 'github-token', repo: 'interacto-ts-api'
}


pipeline {
    agent any

    stages {

        stage('Github Pending') {
            steps{
                script{
                    githubStatusCheck("PENDING", "Building the project");
                }
            }
        }

        stage('Node config') {
            steps {
                nodejs(nodeJSInstallationName: 'node10') {
                    sh 'npm -v'
                }
            }
        }

        stage ('Git') {
            steps {
                git branch: 'master', url: "https://github.com/interacto/interacto-ts-api"
            }
        }
        
        stage ('NPM install') {
            steps {
                nodejs(nodeJSInstallationName: 'node10') {
                    sh '''
                        npm install
                    '''
                }
            }
        }
        
        stage ('NPM build') {
            steps {
                nodejs(nodeJSInstallationName: 'node10') {
                    sh '''
                        npm run package
                    '''
                }
            }
        }
    }

    post{
        success {
            githubStatusCheck("SUCCESS", "Build success");
        }
        failure {
            githubStatusCheck("FAILURE", "Build failure");
        }
    }
}
