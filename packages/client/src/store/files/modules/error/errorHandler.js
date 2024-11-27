import { makeAutoObservable } from "mobx";
import { toastr } from "@docspace/shared/components/toast";

const HTTP_CODES = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  PAYMENT_REQUIRED: 402,
  UNAUTHORIZED: 401
};

export class ErrorHandler {
  lastError = null;
  errorStack = [];
  maxStackSize = 10;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  handleError = (error, context = "") => {
    this.lastError = error;
    this.addToErrorStack(error, context);

    if (error?.response?.status) {
      return this.handleHttpError(error);
    }

    console.error(`Error in ${context}:`, error);
    toastr.error(error);
    return error;
  };

  handleHttpError = (error) => {
    const status = error.response.status;

    switch (status) {
      case HTTP_CODES.UNAUTHORIZED:
        this.handleUnauthorized();
        break;
      case HTTP_CODES.PAYMENT_REQUIRED:
        this.handlePaymentRequired();
        break;
      case HTTP_CODES.FORBIDDEN:
        this.handleForbidden();
        break;
      case HTTP_CODES.NOT_FOUND:
        this.handleNotFound();
        break;
      default:
        toastr.error(error);
    }

    return error;
  };

  handleUnauthorized = () => {
    this.rootStore.authStore?.logout();
  };

  handlePaymentRequired = () => {
    this.rootStore.currentTariffStatusStore?.setTariffStatus("LicenseRequired");
  };

  handleForbidden = () => {
    toastr.error("Access denied");
  };

  handleNotFound = () => {
    toastr.error("Resource not found");
  };

  addToErrorStack = (error, context) => {
    const errorInfo = {
      error,
      context,
      timestamp: new Date(),
    };

    this.errorStack.unshift(errorInfo);
    
    if (this.errorStack.length > this.maxStackSize) {
      this.errorStack.pop();
    }
  };

  clearErrorStack = () => {
    this.errorStack = [];
    this.lastError = null;
  };

  get hasErrors() {
    return this.errorStack.length > 0;
  }

  get lastErrorInfo() {
    return this.errorStack[0];
  }
}

export default ErrorHandler;
