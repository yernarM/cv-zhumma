export class SharedHttpService {

    headers = {};
    private _headers: HttpHeaders = new HttpHeaders({
        // 'Cache-Control': 'no-cache',
        // 'Pragma': 'no-cache',
        // 'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    });;
    private _options: any = {
        'Content-Type': 'application/json',
        headers: this._headers,
        withCredentials: true
    };
    private _apiUrl = environment['apiMasterURL'];
    constructor(
        private _http: HttpClient,
        private cookie: CookieService) {
    }

    get(url, mapper, endpoint, params = null, urlstring = '') {
        const that = this;
        that.setApiUrl(url);
        const queryString = params ? that._objectToQueryString(params) : '';
        endpoint = CONST['apiEndPoint'][mapper][endpoint] + (queryString ? '?' + queryString : '');
        let head: HttpHeaders = new HttpHeaders({
            'Authorization': 'Bearer ' + this.getAccessToken(),
            // 'Cache-Control': 'no-cache',
            // 'Pragma': 'no-cache',
            // 'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
        });
        let options = Object.assign({}, that._options);
        options['headers'] = head;
        return that._http.get(that._apiUrl + endpoint + urlstring, options);
    }
    getfile(url, mapper, endpoint, fileid, params = null, filename = null) {
        const that = this;
        if (filename === null)
            filename = fileid;
        that.setApiUrl(url);
        const queryString = params ? that._objectToQueryString(params) : '';
        endpoint = CONST['apiEndPoint'][mapper][endpoint] + (queryString ? '?' + queryString : '');
        let head: HttpHeaders = new HttpHeaders({
            'Authorization': 'Bearer ' + this.getAccessToken(),
            // 'Cache-Control': 'no-cache',
            // 'Pragma': 'no-cache',
            // 'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
        });
        let options = Object.assign({}, that._options);
        options['headers'] = head;
        options['responseType'] = 'blob';
        options['withCredentials'] = false;
        that._http.get(that._apiUrl + endpoint + '/' + fileid, options).subscribe(res => {
            this.downloadFile(res, filename);
            options['responseType'] = 'json';
        });
        // window.location.href=that._apiUrl + endpoint + '/' + filename;
        return true;
    }
    postFile(url, mapper, endpoint, data, params = null, headers = false) {
        const that = this;
        if (headers) {
            this._options.append('Content-Type', 'multipart/form-data');
        }
        that.setApiUrl(url);
        const queryString = params ? that._objectToQueryString(params) : '';
        endpoint = CONST['apiEndPoint'][mapper][endpoint] + (queryString ? '?' + queryString : '');
        let options = Object.assign({}, that._options);
        let head: HttpHeaders = new HttpHeaders({
            'Authorization': 'Bearer ' + this.getAccessToken()
        });
        options['headers'] = head;
        options['withCredentials'] = false;
        return that._http.post(that._apiUrl + endpoint, data, options);
    }

    downloadFile(data, filename) {

        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.download = filename;
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    getAccessToken() {
        try {
            return this.cookie.get('accessToken');
        } catch (e) {
            return '';
        }
    }

    post(url, mapper, endpoint, data, params = null, headers = false, credentials = true, loader = true,urlstring='') {
        const that = this;
        let header = new HttpHeaders();
        if (headers) {
            header.append('Content-Type', 'multipart/form-data'); this._options['headers'] = header;
        }
        that.setApiUrl(url);
        // if (params) {
            const queryString = params ? that._objectToQueryString(params) : '';
            let endPoints = CONST['apiEndPoint'][mapper][endpoint] + (queryString ? '?' + queryString : '');
        // } else {
        //     endpoint = CONST['apiEndPoint'][mapper][endpoint]
        // }
        let headObj = {
            'Authorization': 'Bearer ' + this.getAccessToken(),
        };
        if (!loader)
            headObj[InterceptorSkipHeader] = "-";
        let head: HttpHeaders = new HttpHeaders(headObj);
        // 'Cache-Control': 'no-cache',
        // 'Pragma': 'no-cache',
        // 'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
        let options = Object.assign({}, that._options);
        if (!credentials)
            options['withCredentials'] = false;
        options['headers'] = head;
        return that._http.post(that._apiUrl + endPoints+urlstring, data, options);

        //  return that._http.post('http://LT0078376:8611/AddCountry', data, that._options);
    }

    put(url, mapper, endpoint, data, params = null) {
        const that = this;
        that.setApiUrl(url);
        endpoint = CONST['apiEndPoint'][mapper][endpoint];
        let options = Object.assign({}, that._options);
        let head: HttpHeaders = new HttpHeaders({
            'Authorization': 'Bearer ' + this.getAccessToken()
        });
        options['headers'] = head;
        return that._http.put(that._apiUrl + endpoint, data, options)
    }

    delete(url, mapper, endpoint, data = {}, params = null) {
        const that = this;
        that.setApiUrl(url);
        const queryString = params ? that._objectToQueryString(params) : '';
        endpoint = CONST['apiEndPoint'][mapper][endpoint] + (queryString ? '?' + queryString : '');
        let options = Object.assign({}, that._options);
        let head: HttpHeaders = new HttpHeaders({
            'Authorization': 'Bearer ' + this.getAccessToken()
        });
        options['headers'] = head;
        return that._http.post(that._apiUrl + endpoint, options, data)
    }

    logout(token) {
        this.setApiUrl('loginUrl');
        let endpoint = CONST['apiEndPoint']['Auth'][`logout`];
        let headObj = {
            'applicationCode': environment['applicationCode'],
            'Content-Type': 'application/json',
            'refresh-token': token
        };
        let headers: HttpHeaders = new HttpHeaders(headObj);
        return this._http.get(this._apiUrl + endpoint, { headers: headers, withCredentials: true })
    }

    private _objectToQueryString(object) {
        return Object
            .keys(object)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`)
            .join('&');
    }

    setApiUrl(url) {
        const that = this;
        that._apiUrl = environment[url];
    }

    postGetFiles(url, mapper, endpoint, data, params = null, headers = false): Observable<any> {
        const that = this;
        that.setApiUrl(url);
        const headerOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            observe: 'response' as 'body',
            responseType: 'blob' as 'blob'
        };
        const queryString = params ? that._objectToQueryString(params) : '';
        endpoint = CONST['apiEndPoint'][mapper][endpoint] + (queryString ? '?' + queryString : '');
        return that._http.post(that._apiUrl + endpoint, data, headerOptions);
    }

    //WSO2 
    getToken(data: string) {
        return this.tokenApi(data, 'get')
    }
    refreshToken(data: string) {
        return this.tokenApi(data, 'refresh');
    }
    tokenApi(data: string, mode: string = 'get') {
        this.setApiUrl('loginUrl');
        let endpoint = CONST['apiEndPoint']['Auth'][`${mode}Token`];
        let headObj = {
            'MYSSO': data,
            'applicationCode': environment['applicationCode'],
            'Content-Type': 'application/json',
        };
        if (mode === 'refresh')
            headObj['refresh-token'] = this.getRefreshToken();
        let headers: HttpHeaders = new HttpHeaders(headObj);
        return this._http.get(this._apiUrl + endpoint, { headers: headers, withCredentials: true })
    }
    getRefreshToken() {
        try {
            return this.cookie.get('refreshToken');
        } catch (e) {
            return '';
        }
    }
    getInProgress = false;
    getUserImage(username) {
        let headObj = {};
        headObj[InterceptorSkipHeader] = "-";
        headObj['Authorization'] = 'Bearer ' + this.getAccessToken()
        let headers: HttpHeaders = new HttpHeaders(headObj);
        let endpoint = CONST['apiEndPoint']['Auth'][`image`];
        return this._http.get(environment['apiWSO2URL'] + endpoint, { headers: headers, observe: 'body', responseType: 'json' }).pipe(tap((res) => this.getInProgress = false));
    }

    getAccess(role) {
        let endpoint = CONST['apiEndPoint']['User'][`menu`];
        return this._http.get(environment['apiWSO2URL'] + endpoint)

    }
}