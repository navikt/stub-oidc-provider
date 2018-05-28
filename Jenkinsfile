node {
    def commitHash, commitHashShort, commitUrl
    def repo = "navikt"
    def app = "stub-oidc-provider"
    def committer, committerEmail, changelog, releaseVersion
	
    stage("Initialization") {
        cleanWs()
        withCredentials([string(credentialsId: 'OAUTH_TOKEN', variable: 'token')]) {
           withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
            sh(script: "git clone https://${token}:x-oauth-basic@github.com/${repo}/${app}.git .")
           }
         }
        commitHash = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
        commitHashShort = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        commitUrl = "https://github.com/${repo}/${app}/commit/${commitHash}"
        committer = sh(script: 'git log -1 --pretty=format:"%an"', returnStdout: true).trim()
        committerEmail = sh(script: 'git log -1 --pretty=format:"%ae"', returnStdout: true).trim()
        changelog = sh(script: 'git log `git describe --tags --abbrev=0`..HEAD --oneline', returnStdout: true)

        //notifyGithub(repo, app, 'continuous-integration/jenkins', commitHash, 'pending', "Build #${env.BUILD_NUMBER} has started")

        releaseVersion = "${env.major_version}.${env.BUILD_NUMBER}-${commitHashShort}"
    }
	
    stage("Build & publish") {
       
        sh "docker build --build-arg version=${releaseVersion} --build-arg app_name=${app} -t ${env.USERNAME}/${app}:${releaseVersion} ."
		sh "docker login -u ${env.USERNAME} -p ${env.PASSWORD} && docker push ${env.USERNAME}/${app}:${releaseVersion}"
       

    }

    /*stage("Tag") {
        withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
            withCredentials([string(credentialsId: 'OAUTH_TOKEN', variable: 'token')]) {
                sh ("git tag -a ${releaseVersion} -m ${releaseVersion}")
                sh ("git push https://${token}:x-oauth-basic@github.com/${repo}/${app}.git --tags")
            }
        }
    }*/
