define([
    'jquery',
    'Magento_Ui/js/form/element/abstract',
    'Experius_Postcode/js/action/postcode',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/checkout-data',
    'uiRegistry'
], function($,Abstract,getPostcodeInformation,quote,checkoutData,registry) {
    'use strict';
    return Abstract.extend({
        defaults: {
          listens: {
            focused: 'postcodeHasChanged',
            'value': 'onCheckedChanged'
          },
          checkDelay: 2000,
          emailCheckTimeout: 0,
          isLoading: false,
          checkRequest: null,
          isPostcodeCheckComplete: null,
          addressType: 'shipping',
            imports: {
                update: '${ $.parentName }.country_id:value'
            }
        },
        initialize: function () {
            _.bindAll(this, 'reset');

            this._super()
                .setInitialValue()
                ._setClasses()
                .initSwitcher();
            
            if(this.index=='experius_postcode_housenumber'){    
                
                var self = this;
                
                setTimeout(function () {
                     self.postcodeHasChanged();
                }, self.checkDelay);
               
            }

            if(this.index=='experius_postcode_disable' && this.getInitialValue()){
                this.showFields();
            }
            
            if(this.index=='experius_postcode_housenumber_addition' && this.getInitialValue()){
                this.visible = false;
            }

            return this;
        },
        update: function (value) {
            if(this.index=='experius_postcode_disable'){
                this.toggleFieldsByCountry(this.source.get(this.parentScope));
            }
        },
        toggleFieldsByCountry: function(address){
            if(address.country_id=='NL' && !address.experius_postcode_disable){
                this.hideFields();
                this.debug('hide fields based on country value');
                registry.get(this.parentName + '.experius_postcode_disable').set('visible',true);
            } else {
                this.showFields();
                this.debug('show fields based on country value');
                registry.get(this.parentName + '.experius_postcode_disable').set('visible',false);
                registry.get(this.parentName + '.experius_postcode_disable').set('value',false);
            }
        },
        initObservable: function () {
            var rules = this.validation = this.validation || {};

            this._super();

            this.observe('checked error disabled focused preview visible value warn isDifferedFromDefault notice')
                .observe('isUseDefault')
                .observe({
                    'required': !!rules['required-entry']
                });
            
            return this;
        },
        onCheckedChanged: function () {
            if (this.index=='experius_postcode_disable' && this.getInitialValue()){
                 this.showFields();
                 return;
            } else if(this.index=='experius_postcode_disable' && this.source.get(this.parentScope).country_id=='NL') {
                this.hideFields();
            }
        },
        postcodeHasChanged: function() {

            if(this.index=='experius_postcode_housenumber' || this.index=='experius_postcode_postcode'){
            
                var self = this;
                
                var formData = this.source.get(this.parentScope);
                
                this.debug(formData);
                
                if(!formData.experius_postcode_disable && formData.country_id=='NL') {
                    this.hideFields();               
                }            
                
                if(formData.experius_postcode_postcode && formData.experius_postcode_housenumber && formData.experius_postcode_disable !== true && formData.country_id=='NL') {
                    this.debug('start postcode lookup');
                    clearTimeout(this.emailCheckTimeout);
                    this.emailCheckTimeout = setTimeout(function () {
                        self.getPostcodeInformation();
                    }, self.checkDelay);
                } else {
                    this.debug('postcode or housenumber not set. ' + 'housenumber:' + formData.experius_postcode_housenumber + ' postcode:' + formData.experius_postcode_postcode);   
                }
            
            }

        },
        hideFields: function(){
            
            this.debug('hide magento default fields');
            
            if (registry.get(this.parentName + '.street')) {
                registry.get(this.parentName + '.street').set('visible',false);
            }
            
            if(registry.get(this.parentName + '.street.0')) {
                registry.get(this.parentName + '.street.0').set('visible',false).set('labelVisible',false).set('disabled',true);
            }
            
            if(registry.get(this.parentName + '.street.1')) {
                registry.get(this.parentName + '.street.1').set('visible',false).set('labelVisible',false).set('disabled',true);
            }
        
            if(registry.get(this.parentName + '.postcode')) {
                registry.get(this.parentName + '.postcode').set('visible',false).set('labelVisible',false).set('disabled',true);
            }
            
            if (registry.get(this.parentName + '.region_id')) {
                registry.get(this.parentName + '.region_id').set('visible',false).set('labelVisible',false).set('disabled',true);
            }
             
            if (registry.get(this.parentName + '.region')) {
                registry.get(this.parentName + '.region').set('visible',false).set('labelVisible',false).set('disabled',true).setVisible(false);
            }
           
            if (registry.get(this.parentName + '.country_id') && !this.getSettings().neverHideCountry) {
                registry.get(this.parentName + '.country_id').set('visible',false).set('labelVisible',false).set('disabled',true);
            }
            
            if (registry.get(this.parentName + '.city')) {
                registry.get(this.parentName + '.city').set('visible',false).set('labelVisible',false).set('disabled',true);
            }
            
            //dirty fix for now
            $('fieldset.street').css('margin','0px').hide();
            $('div[name="'+this.parentScope+'.region"]').hide();
            
            //show postcode fields
            registry.get(this.parentName + '.experius_postcode_postcode').set('visible',true);
            registry.get(this.parentName + '.experius_postcode_housenumber').set('visible',true);

            if(registry.get(this.parentName + '.experius_postcode_housenumber_addition'))
            {
                registry.get(this.parentName + '.experius_postcode_housenumber_addition').set('visible', false);
            }

        },
        showFields: function(){
            
            this.debug('show magento default fields');
            
            if (registry.get(this.parentName + '.street')) {
                registry.get(this.parentName + '.street').set('visible',true);
            }
            
            if(registry.get(this.parentName + '.street.0')) {
                registry.get(this.parentName + '.street.0').set('visible',true).set('labelVisible',false).set('disabled',false);
            }
            
            if(registry.get(this.parentName + '.street.1')) {
                registry.get(this.parentName + '.street.1').set('visible',true).set('labelVisible',false).set('disabled',false);
            }
        
            if(registry.get(this.parentName + '.postcode')) {
                registry.get(this.parentName + '.postcode').set('visible',true).set('labelVisible',false).set('disabled',false);
            }
            
            if (registry.get(this.parentName + '.region_id')) {
                registry.get(this.parentName + '.region_id').set('visible',true).set('labelVisible',false).set('disabled',false);
            }
             
            if (registry.get(this.parentName + '.region')) {
                registry.get(this.parentName + '.region').set('visible',true).set('labelVisible',true).set('disabled',false).setVisible(true);
            }
           
            if (registry.get(this.parentName + '.country_id') && !this.getSettings().neverHideCountry) {
                 registry.get(this.parentName + '.country_id').set('visible',true).set('labelVisible',true).set('disabled',false);
            }
           
            if (registry.get(this.parentName + '.city')) {
                registry.get(this.parentName + '.city').set('visible',true).set('labelVisible',true).set('disabled',false);
            }
            
            //dirty fix for now
            $('fieldset.street').css('margin-top','15px').show();
            $('div[name="'+this.parentScope+'.region"]').show();
            
            // Hide postcode fields
            
            if (registry.get(this.parentName + '.experius_postcode_postcode')) {
                registry.get(this.parentName + '.experius_postcode_postcode').set('visible',false);
            }
            
            if (registry.get(this.parentName + '.experius_postcode_housenumber')) {
                registry.get(this.parentName + '.experius_postcode_housenumber').set('visible',false);
            }
            
            if (registry.get(this.parentName + '.experius_postcode_housenumber_addition')) {
                registry.get(this.parentName + '.experius_postcode_housenumber_addition').set('visible',false);
            }
        },
        getSettings: function() {
            var settings = window.checkoutConfig.experius_postcode.settings;
            return settings;
        },
        getPostcodeInformation: function () {
            
            var self = this;
            var response = false;
            var formData = this.source.get(this.parentScope);

            this.validateRequest();
            this.isPostcodeCheckComplete = $.Deferred();
            this.checkRequest = getPostcodeInformation(this.isPostcodeCheckComplete,formData.experius_postcode_postcode,formData.experius_postcode_housenumber);

            this.isLoading = true;

            $.when(this.isPostcodeCheckComplete).done(function (data) {
                
                response = JSON.parse(data);
                
                self.debug(response);
                
                if (response.street) {
                    self.error(false);
                    
                    if(self.getSettings().useStreet2AsHouseNumber){
                        registry.get(self.parentName + '.street.0').set('value',response.street).set('error',false);
                        registry.get(self.parentName + '.street.1').set('value',response.houseNumber).set('error',false);
                        self.debug('address on two lines');
                    } else {
                        registry.get(self.parentName + '.street.0').set('value',response.street + ' ' + response.houseNumber).set('error',false);
                        self.debug('address on single line');
                    }
                    registry.get(self.parentName + '.country_id').set('value','NL').set('error',false);
                    registry.get(self.parentName + '.region_id').set('value',response.province).set('error',false);
                    registry.get(self.parentName + '.city').set('value',response.city).set('error',false);
                    registry.get(self.parentName + '.postcode').set('value',response.postcode).set('error',false);
                    
                    registry.get(self.parentName + '.experius_postcode_housenumber').set('notice','<br/>' + response.street + ' ' + response.houseNumber + '<br/>' + response.postcode + ' ' + response.city + '<br/>Nederland');
                
                    self.setHouseNumberAdditions(response.houseNumberAdditions);
                
                } else {
                    registry.get(self.parentName + '.experius_postcode_housenumber').set('error',response.message);
                    registry.get(self.parentName + '.experius_postcode_housenumber').set('notice',false);
                    registry.get(self.parentName + '.street.0').set('value','');
                    registry.get(self.parentName + '.street.1').set('value','');
                    registry.get(self.parentName + '.country_id').set('value','');
                    registry.get(self.parentName + '.region_id').set('value','');
                    registry.get(self.parentName + '.city').set('value','');
                    registry.get(self.parentName + '.postcode').set('value','');
                    registry.get(self.parentName + '.experius_postcode_housenumber_addition').set('visible',false);
                }

                this.isLoading = false;

            }).fail(function () {
                // fail
            }).always(function () {
            });

        },
        setHouseNumberAdditions: function(additions){

            if(registry.get(this.parentName + '.experius_postcode_housenumber_addition') && additions.length>1 && !registry.get(this.parentName + '.experius_postcode_disable').get('value')) {
                
                var options = [];
                $.each(additions, function(key,addition){
                    if (!addition) {
                        options[key] = {'label':'No addition','labeltitle':'No addition','value':''};
                    } else {
                        options[key] = {'label':addition,'labeltitle':addition,'value':addition};
                    }
                });
                
                registry.get(this.parentName + '.experius_postcode_housenumber_addition').set('visible',true).set('options',options);
            }  else if(registry.get(this.parentName + '.experius_postcode_housenumber_addition')) {
                registry.get(this.parentName + '.experius_postcode_housenumber_addition').set('visible',false);
            }
        },
        validateRequest: function () {
            if (this.checkRequest != null && $.inArray(this.checkRequest.readyState, [1, 2, 3])) {
                this.checkRequest.abort();
                this.checkRequest = null;
            }
        },
        debug: function(message){
            if(this.getSettings().debug){
                console.log(this.parentName);
                console.log(message);
            }
        }
    });
});