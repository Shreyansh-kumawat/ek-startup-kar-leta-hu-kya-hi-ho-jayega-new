// Backend/utils/responseUtils.js

const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message
  };
  
  if (error && process.env.NODE_ENV === 'development') {
    response.error = typeof error === 'string' ? error : error.message;
  }
  
  return res.status(statusCode).json(response);
};


module.exports = {
  successResponse,
  errorResponse
};
