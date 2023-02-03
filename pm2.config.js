module.exports = {
  apps: [
    {
      name: "nodejs-sequelize-pm2", // pm2 name
      script: "./index.js", // // 앱 실행 스크립트
      exec_mode: "fork", // fork, cluster 모드 중 선택
      autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
      watch: false, // 파일이 변경되었을 때 재시작 할지 선택
      PORT: 5000,
      env_development: {
        // 개발 환경설정
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
