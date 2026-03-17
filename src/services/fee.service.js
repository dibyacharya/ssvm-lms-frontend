import api from './api';

export const getMyFees = async () => {
  const response = await api.get('/fees/my-fees');
  return response.data;
};

export const getMyFeePeriod = async (periodNumber) => {
  const response = await api.get(`/fees/my-fees/${periodNumber}`);
  return response.data;
};

export const getReceipt = async (recordId) => {
  const response = await api.get(`/fees/my-fees/${recordId}/receipt`);
  return response.data;
};

export const getLockStatus = async () => {
  const response = await api.get('/fees/lock-status');
  return response.data;
};

export const initiatePayment = async (recordId) => {
  const response = await api.post('/fees/payment/initiate', { recordId });
  return response.data;
};

export const getPaymentStatus = async (recordId) => {
  const response = await api.get(`/fees/payment/status/${recordId}`);
  return response.data;
};
