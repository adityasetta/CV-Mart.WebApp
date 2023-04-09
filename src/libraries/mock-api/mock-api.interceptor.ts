import { Injectable } from "@angular/core";
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, switchMap, throwError, of } from "rxjs";
import { MockApiService } from "./mock-api.service";

@Injectable({
    providedIn: 'root'
})
export class MockApiInterceptor implements HttpInterceptor
{
    constructor(private _MockApiService: MockApiService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        const { handler, urlParams } = this._MockApiService.findRequestHandler(request.method, request.url);

        if ( !handler )
        {
            return next.handle(request);
        }

        handler.request = request;
        handler.urlParams = urlParams;

        return handler.response.pipe(
            delay(handler.delay ?? 0),
            switchMap((response) => {
                if ( !response )
                {
                    response = new HttpErrorResponse({
                        error     : 'Service not found',
                        status    : 404
                    });

                    return throwError(() => response);
                }
                const data = { status: response[0], body  : response[1] };

                if ( data.status >= 200 && data.status < 300 )
                {
                    response = new HttpResponse({
                        body      : data.body,
                        status    : data.status,
                        statusText: 'OK'
                    });

                    return of(response);
                }

                response = new HttpErrorResponse({
                    error     : data.body.error,
                    status    : data.status
                });

                return throwError(() => response);
            }));
    }
}
