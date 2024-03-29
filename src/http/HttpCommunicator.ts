import { Observable } from "rxjs";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { cloneWith } from "../random/utils";
import { singleton } from "../mapping/operators";
import defaultErrorHandler from "./defaultErrorHandler";
import { catchError } from "rxjs/operators";

export type QueryParams = {[name:string]: string|number|boolean|undefined};
export type JsonData = {[name: string]: any};
export type HttpRequestHeaders = {[name: string]: string};
export type HttpError = HttpResponseError | HttpRequestError | HttpUnknownError;

export type HttpRequestOptionsProvider = () => HttpRequestOptions
export type HttpErrorHandler = (error: HttpError) => Observable<any>;

export class HttpResponseError {
    constructor(public status: number, public data: any) {

    }
}

export class HttpRequestError {
    
}

export class HttpUnknownError {

}

export interface HttpRequestOptions {
    headers?: HttpRequestHeaders
}

export interface HttpCommunicatorOptions {
    baseUrl: string;
    requestOptionsProvider?: HttpRequestOptionsProvider;
    errorHandler?: HttpErrorHandler;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

function convertError(axiosError: AxiosError): HttpError {
    let response = axiosError.response;
    let request = axiosError.request;

    if (response) {
        return new HttpResponseError(response.status, response.data);
    }
    
    if (request) {
        return new HttpRequestError();
    }

    return new HttpUnknownError();
}

export default class HttpCommunicator {
    
    private client: AxiosInstance;
    
    private requestOptionsProvider?: HttpRequestOptionsProvider;
    private errorHandler = defaultErrorHandler;

    constructor(options: HttpCommunicatorOptions) {

        this.requestOptionsProvider = options.requestOptionsProvider;

        if (options.errorHandler) {
            this.errorHandler = options.errorHandler;
        }

        this.client = axios.create({ baseURL: options.baseUrl });
    }

    get<T>(endpoint: string, query?: QueryParams): Observable<T> {
        return this.communicate('GET', endpoint, query);
    }

    post<T>(endpoint: string, data?: JsonData | FormData): Observable<T> {
        return this.communicate('POST', endpoint, data);
    }

    patch<T>(endpoint: string, updates?: JsonData | FormData): Observable<T> {
        return this.communicate('PATCH', endpoint, updates);
    }

    put<T>(endpoint: string, replacement?: JsonData | FormData): Observable<T> {
        return this.communicate('PUT', endpoint, replacement);
    }

    delete<T>(endpoint: string, query?: QueryParams): Observable<T> {
        return this.communicate('DELETE', endpoint, query); 
    }

    loadBase64Image(endpoint: string, query?: QueryParams): Observable<string> {
        let config: AxiosRequestConfig = {
            method: 'GET',
            url: endpoint,
            params: query,
            data: {}
        };
        
        this.customizeRequestConfig(config);

        config['responseType'] = 'arraybuffer';

        return singleton<string>((done, reject) => {
            this.client.request(config)
                    .then(response => {
                        var data = Buffer.from(response.data, 'binary').toString('base64');
                        data = `data:${response.headers['Content-Type']};base64,` + data;
                        done(data);
                    })
                    .catch(reject);
        }).pipe(
            catchError(error => this.handleError(error))
        )
    }

    private communicate<T>(method: HttpMethod, endpoint: string, data?: JsonData | JsonData[] | QueryParams | FormData): Observable<T> {

        let config: AxiosRequestConfig = {
            method,
            url: endpoint,
        };

        if (['GET', 'DELETE'].indexOf(method) > -1) {
            config['params'] = data || {};
            config['data'] = {};
        } else {
            config['data'] = data || {};
        }

        this.customizeRequestConfig(config);
        
        if (data instanceof FormData) {
            config['headers'] = {...config['headers'], 'Content-Type': 'multipart/form-data'}
        }
        
        return singleton<T>((done, reject) => {
            this.client.request(config)
                    .then(response => done(response.data))
                    .catch(reject);
        }).pipe(
            catchError(error => this.handleError(error))
        )
    }

    private customizeRequestConfig(config: AxiosRequestConfig) {
        if (this.requestOptionsProvider) {
            let options = this.requestOptionsProvider();

            if (options.headers) {
                config['headers'] = cloneWith(config['headers'] || {}, options.headers);
            }
        }
    }

    private handleError(axiosError: AxiosError): Observable<any> { 
        return this.errorHandler(convertError(axiosError));
    }
}