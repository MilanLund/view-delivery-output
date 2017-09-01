var helper = {
    STORAGE_KEY: 'delivery-view-options',

    getMandatoryFields: function (options) {
        var mandatoryFields = ['queryString', 'projectId'];

        if (options.previewContent === true) {
            mandatoryFields.push('previewKey');
        }

        return mandatoryFields
    },

    getTrimmedString: function (text) {
        var output;

        if (typeof text === 'string') {
            output = text && text.trim();
        } else {
            output = text;
        }

        return output;
        
    },

    setLocalStorage: function (options) {
        localStorage.setItem(helper.STORAGE_KEY, JSON.stringify(options));
    },

    getLocalStorage: function (state) {
        var options = JSON.parse(localStorage.getItem(helper.STORAGE_KEY) || '{}');
        
        if (Object.keys(options).length > 0 && options.constructor === Object) {
            state.options = options;
        }
    },       

    validateOptions: function (options) {
        var output = {
            validationMessage: '',
            options: {}
        }
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                output.options[key] = helper.getTrimmedString(options[key]);
                if(!options[key] && helper.getMandatoryFields(options).indexOf(key) > -1) {
                    output.validationMessage += 'Field ' + key + ' is mandatory. ';
                }
            }
        }

        return output;
    },

    getRequestUrl: function (options) {
        var preview = '';

        if (options.previewKey !== '' && options.previewContent === true) {
            preview = 'preview-';
        }

        return 'https://' + preview + 'deliver.kenticocloud.com/'+ options.projectId +'/items' + options.queryString;
    },

    requestDelivery: function (state) { 
        state.requestedUrl = helper.getRequestUrl(state.options);

        $.ajax({
            url: state.requestedUrl,
            dataType: 'json',
            beforeSend: function(xhr, settings) { 
                if (state.options.previewKey !== '' && state.options.previewContent === true) {
                    xhr.setRequestHeader('Authorization','Bearer ' + state.options.previewKey); 
                }    
            }
        }).done(function(data) {               
            state.response = data;
            console.log(data);
            state.codeEditor.setValue(js_beautify(JSON.stringify(state.response), {indent_size: 4}));
        })
        .fail(function() {
            state.validationMessage = 'Kentico Cloud responded with an error. Check browser console for more information.'
        })
        .always(function() {
            console.log( "Request completed." );
        });
    }
}

var app = new Vue({
    el: '#app',
    data: {
        options: {
            queryString: '',
            projectId: '',
            previewKey: '',
            previewContent
        },
        requestedUrl: '',
        response: '',
        validationMessage: '',
        codeEditor: {}
    },
    mounted: function () {
        var that = this;
        helper.getLocalStorage(that);
        that.codeEditor = codeEditor.init('response', 'application/json');
    },
    methods: {
        makeRequest: function () {
            var that = this,
                output = {};
            
            that.validationMessage = '';

            output = helper.validateOptions(that.options);

            if (output.validationMessage === '') {
                that.options = output.options;
                helper.requestDelivery(that);
                helper.setLocalStorage(that.options);
            } else {
                that.validationMessage = output.validationMessage;
            }

        },
        prefillOptions: function () {
            var that = this;

            that.options.queryString = '?system.type=blog_post';
            that.options.previewKey = 'ew0KICAiYWxnIjogIkhTMjU2IiwNCiAgInR5cCI6ICJKV1QiDQp9.ew0KICAidWlkIjogInVzcl8wdlVJVzkwTnRQSVNxNm1GSDN2ZFhiIiwNCiAgImVtYWlsIjogImhlbGxvQG1pbGFubHVuZC5jb20iLA0KICAicHJvamVjdF9pZCI6ICIyNTQ4MTIxZC1jYWQ4LTQ0NTgtYTkxMC01ZTRiNTRjYjA5NTYiLA0KICAianRpIjogInhrU1BLUjlzbzgxSV9rel8iLA0KICAidmVyIjogIjEuMC4wIiwNCiAgImdpdmVuX25hbWUiOiAiTWlsYW4iLA0KICAiZmFtaWx5X25hbWUiOiAiTHVuZCIsDQogICJhdWQiOiAicHJldmlldy5kZWxpdmVyLmtlbnRpY29jbG91ZC5jb20iDQp9.PpBh6wTk57e1_tPHzROiqWPTpr3IjrEoGN8J4rtfPIg';
            that.options.projectId = '2548121d-cad8-4458-a910-5e4b54cb0956';
            that.options.previewContent = true;
        }
    }
});