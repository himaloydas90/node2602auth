const express = require("express");
const router = express.Router();
const api = process.env.BASE_URL || '/node-api/v1';
const apiRoute = require('./api')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger-output.json');

router.use(api, apiRoute)
swaggerDocument.basePath = api;
swaggerDocument.securityDefinitions = {
   bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authentication',
      description: 'Enter your Bearer token in the format: Bearer <your_token_here>'
   }
};

Object.entries(swaggerDocument.paths).forEach(([path, operation]) => {
   const requireAuthentication =
      path === "/auth/me" ||
      path === "/auth/profile" ||
      path === "/dashboard/allusers" ||
      path === "/dashboard/singleuser/{id}" ||
      path === "/dashboard/approveuser/{id}" ||
      path === "/dashboard/deleteuser/{id}" ||
      path === "/task/taskCreate" ||
      path === "/task/updateTaskStatus/{taskId}";
   if (requireAuthentication) {
      Object.values(operation).forEach((operation) => {
         operation.security = [{
            bearerAuth: [],
         }, ];
      });
   }
});
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

router.use((req, res) => {
   res.send("no api found in this route");
});

module.exports = router