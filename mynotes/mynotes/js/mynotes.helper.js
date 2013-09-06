(function($){

var mynotes = window.mynotes = window.mynotes || {},
    helper = mynotes.helper 
        = mynotes.helper || {};

function escapeRegExp(str){
    return str.replace(/\^|\$|\\|\(|\)|\[|\]|\+|\.|\*|\?/g, '\\$&');
}

function escapeHTML(str){
    if($('#_text_holder').length == 0){
        $('body').append($('<div id="_text_holder"></div>').hide());
    }
    return $('#_text_holder').text(str).html();
}

function highlight(keyWord, data){
    // 空白也作为查询对象
    // keyWord = keyWord.replace(/^\s+|\s+$/g, '');

    var pattern = null,
        keyWords = []; 
    
    if(typeof(keyWord) != 'undefined'
        && keyWord != null
        && keyWord != ''){

        // 如果是number就不能split了
        keyWords = (keyWord + '').split(/\s\+\s/);
        for(var i=0; i<keyWords.length; i++){
            keyWords[i] = escapeRegExp(keyWords[i]);
        }
        pattern = new RegExp(keyWords.join('|'), 'gi');

    }

    // console.log(pattern);

    for(var i=0; i<data.length; i++){

        if(null !== pattern){
            // 第一次正则替换，保护高亮样式
            data[i].text = data[i].text.replace(
                    pattern, '___@1___span class="key-word"___@2___$&___@1___/span___@2___');
        }

        // HTML转义
        data[i].text = escapeHTML(data[i].text); 

        if(null !== pattern){
            // 第二次正则替换，恢复高亮样式
            data[i].text = data[i].text.replace(
                /___@(\d)___/g, function($0, $1){
                    if($1 == 1){
                        return '<';
                    }
                    return '>';
                });
        }

        // 保持缩进
        data[i].text = data[i].text.replace(/\t+|\s{2,}/g, function($0){
            var str = '';
            for(var i=0; i<$0.length; i++){
                // 制表符用四个空格代替
                if($0[i] == '\t'){
                    str += '&nbsp;&nbsp;&nbsp;&nbsp;';
                }
                else{
                    str += '&nbsp;'; 
                }
            } 
            return str;
        });
    }
}


// interface
$.extend(helper, {
    escapeRegExp: escapeRegExp
    ,escapeHTML: escapeHTML
    ,highlight: highlight
})


})(Zepto);

