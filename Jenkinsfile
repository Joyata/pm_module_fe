pipeline {
   agent any
   environment {
     SERVICE_NAME = "mf-tpm"
	 NAMESPACE = "platform-app"
	 WEB_FOLDER= "/var/www/html"
   }

   stages {
     stage('Preparation') {
        steps {
           cleanWs deleteDirs: true, patterns: [[pattern: 'node_modules', type: 'EXCLUDE']]
           git branch: 'main', credentialsId: 'f184af08-bec6-4143-b887-27af53873d6d', url: "https://gitlab.com/tpm2191622/frontend.git"
        }
   }

   stage('Build Compile') {
     steps {
	    sh 'npm install --force  --production=false'
	    sh 'npm run build:dev'
     }
    }

  stage('Deploy to Cluster') {
    steps {
	  sh 'mkdir -p ${WEB_FOLDER}/${SERVICE_NAME}'
      sh 'cp -R dist/* ${WEB_FOLDER}/${SERVICE_NAME}'
    }
  }

 }
}
