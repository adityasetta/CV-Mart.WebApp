import { HttpRequest } from "@angular/common/http";
import { Observable, throwError, take, of } from "rxjs";
import { MockApiReplyCallback } from "./mock-api.types";

export class MockApiHandler
{
    request!: HttpRequest<any>;
    urlParams!: { [key: string]: string };

    private replyCallback: MockApiReplyCallback = undefined;

    constructor(
        public url: string,
        public delay?: number) { }

    get response(): Observable<any>
    {
        if ( !this.replyCallback || !this.request )
        {
            return throwError(() => 'Request is invalid');
        }

        const replyResult = this.replyCallback({
            request  : this.request,
            urlParams: this.urlParams
        });
        if ( replyResult instanceof Observable )
        {
            return replyResult.pipe(take(1));
        }

        return of(replyResult).pipe(take(1));
    }

    reply(callback: MockApiReplyCallback): void
    {
        this.replyCallback = callback;
    }
}
