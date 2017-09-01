var helper = {
    STORAGE_KEY: 'delivery-view-options',

    getTrimmedString: function (text) {
        return text && text.trim();
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
                if(!options[key]) {
                    output.validationMessage += 'Field ' + key + ' is mandatory. ';
                }
            }
        }

        return output;
    },

    getRequestUrl: function (options) {
        return 'https://deliver.kenticocloud.com/'+ options.projectId +'/items' + options.queryString;
    },

    requestDelivery: function (state) { 
        state.requestedUrl = helper.getRequestUrl(state.options);

        $.ajax({
            url: state.requestedUrl,
            dataType: 'json'
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
            that.options.projectId = '2548121d-cad8-4458-a910-5e4b54cb0956';
        }
    }
});