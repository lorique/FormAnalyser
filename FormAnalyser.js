/**
 * Please report any bugs or possible enhancements.
 *
 * @name FormAnalyser
 * @description A script for analysing form performance, using google analytics.
 * @author Martin Ricken <kreean(at)lorique.net> 
 * @version beta2
 */


var FormAnalyser = {
    currentPage : undefined,
    formData : [],
    formElements : [],
    formTracked : [],
    
    __init : function(){
        
        this.__hasGaq();
        
        this.currentPage = document.location.pathname;
        
        $('form').each(function(){
            var formName = undefined;
            if(this.getAttribute('name')){
                formName = this.getAttribute('name');
            }else if(this.getAttribute('id')){
                formName = this.getAttribute('id');
            }
            
            var items = $(this).find(':input');
            var i = 0;
            while(i < items.length){
                if(FormAnalyser.__allowedType($(items[i]).attr('type').toLowerCase())){
                    FormAnalyser.formElements[$(items[i]).attr('name')] = i;
                    FormAnalyser.track(items[i], 'input_load', formName);
                }
                i++;
            }
        });
    },
    
    track : function(formElement, eventName, formName){
        if(FormAnalyser.__allowedType($(formElement).attr('type').toLowerCase())){
            var formElementID = FormAnalyser.formElements[$(formElement).attr('name')];
            if(FormAnalyser.formData[formElementID]){
                FormAnalyser.formData[formElementID].name = $(formElement).attr('name');
                FormAnalyser.formData[formElementID].event = eventName;
                FormAnalyser.formData[formElementID].element = formElement;
            }else{
                FormAnalyser.formData[formElementID] = {
                    name : $(formElement).attr('name'),
                    event : eventName,
                    element : formElement,
                    form : formName
                }
            }
        }
    },
    
    commit : function(commitType){
        var i = 0;
        while(i < this.formData.length){
            if(this.formData[i].event != 'input_load'){
                var event = this.formData[i].event.toLowerCase();
                
                var info = undefined;
                if(this.formData[i].form != undefined){
                    info = ' Form: '+this.formData[i].form;
                }
                
                if(commitType == 'submit'){
                    if(this.formTracked[this.formData[i].form] != 1){
                        this.formTracked[this.formData[i].form] = 1;
                        try{
                            this.__trackEvent('form_submit', this.formData[i].form)
                        }catch(e){
                            alert('FormAnalyser failed to track event, error was: '+e);
                        }
                    }
                }
                
                this.__trackEvent(event, this.formData[i].name.toLowerCase(), undefined, info);
            }
            i++;
        }
        
        
    },
    
    __trackEvent : function(action, label, value, info){
        if(this.__hasGaq()){
            try{
                var text = "FormAnalyser results: " + this.currentPage;
                if(info != undefined){
                    text += ' '+info;
                }
                var fails = _gaq.push(['_trackEvent',text, action, label]);
                if(fails > 0){
                    alert('Tracking failed for: ' + label);
                }
            }catch(e){
                alert('FormAnalyser failed to track event, error was: '+e);
            }
        }
    },
    
    __allowedType : function(type){
        switch(type){
            case 'button':
            case 'submit':
            case 'hidden':
                return false;
            default:
                return true;
        }
    },
    
    __hasGaq : function(){
        if(typeof(window["_gaq"]) == "undefined"){
            alert('FormAnalyser does not detect Google Analytics presence on your site.');
            return false;
        }
        return true;
    }
    
}


$(document).ready(function(){
    if($('form').length > 0){
        
        FormAnalyser.__init();
        
        $(':input').blur(function () {
            if($(this).val().length > 0){
                FormAnalyser.track(this, 'input_not_empty');
            }else{
                FormAnalyser.track(this, 'input_empty');
            }
        });
        
        $('form').submit(function(){
            FormAnalyser.commit('submit'); 
        });
        
        $(document).unload(function(){
            FormAnalyser.commit('unload');
        });
    }
    
});