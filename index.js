function process(data) {
    var lines = data.split('\n');
    var lexemes = lines.map(l => lexer(l, false));
    return lexemes;
}

function lexer(line, spaces) { // lexical analyser i.e. lexer
    var logger = false;
    var tokens_logger = false;
    if(logger) {
        console.log(line);
    }
    var keywords = "module func param result export func memory import mut data table elem type shared local".split(' ');
    var types = "i32 i64 f32 f64 v128".split(' ');
    
    var parens = "()";
    var punctuation = ".";

    // tear line apart:
    var tokens = []; // tokens being lexemes
    var token_str = "";
    var token_type = null;
    var token_first_letter = true;

    for(var x = 0; x < line.length; x++) {
        var letter = line[x];
        var first_letter = (x == 0);
        var is_there_next_letter = (x + 1) < line.length;
        var next_letter = is_there_next_letter ? line[x+1] : null;
        var is_there_second_next_letter = (x + 2) < line.length;
        var second_next_letter = is_there_second_next_letter ? line[x+2] : null;
        var is_there_third_next_letter = (x + 3) < line.length;
        var third_next_letter = is_there_third_next_letter ? line[x+3] : null;

	var is_lowercase_letter = (l) => l >= 'a' && l <= 'z';
	var is_uppercase_letter = (l) => l >= 'A' && l <= 'Z';
        var is_letter = (l) => is_lowercase_letter(l) || is_uppercase_letter(l);
	var is_digit = (l) => l >= '0' && l <= '9';

        var identifierFirstLetter = (l) => (is_lowercase_letter(l)||(l=='_')||(l=='$'));
        var identifierLetter = (l) => (is_lowercase_letter(l)||is_uppercase_letter(l)||is_digit(l)||(l=='_')||(l=='/'));

        if(token_first_letter && is_digit(letter)) {
            token_type = "Number";
            token_str = letter;
            token_first_letter = false;
            if(!is_digit(next_letter)) {
                token_type = null;
                token_str = "";
                token_first_letter = true;
                tokens.push(["Number", letter]);
            }
        } else if((token_type == "Number")) {
            if(is_digit(letter)) {
                token_str += letter;
                if(!is_digit(next_letter)) {
                    token_type = null;
                    token_first_letter = true;
                    tokens.push(["Number", token_str]);
                    token_str = "";
                }
            } else {
                token_type = null;
                token_first_letter = true;
                tokens.push(["Number", token_str]);
                token_str = "";
                x--;
            }
        } else if(token_first_letter && (letter == punctuation)) {
            tokens.push(["Punctuation", letter]);
        } else if(token_first_letter && ("()".indexOf(letter)!=-1)) {
            tokens.push(["Parentheses", letter]);
        } else if(token_first_letter && (letter == '"')) {
            token_type = "String";
            token_str = letter;
            token_first_letter = false;
        } else if(token_type == "String") {
            if(letter != '"') {
                if(letter == '\\') {
                    if(is_there_next_letter && (next_letter == '"')) {
                        token_str += '\\"';
                        x++;
                        continue;
                    }
                } else token_str += letter;
            } else {
                token_str += letter;
                tokens.push([token_type, token_str]);
                token_type = null;
                token_first_letter = true;
            }
        } else if(token_first_letter && identifierFirstLetter(letter)) {
            if(letter == '$') {
                token_type = "Identifier";
            } else token_type = "Operator";
            token_str = letter;
            token_first_letter = false;
            if((x == line.length - 1) || is_there_next_letter) {
                if((x == line.length - 1) || (!identifierLetter(next_letter))) {
                    if(keywords.indexOf(token_str) != -1)
                        token_type = "KeyWord";
                    tokens.push([token_type, token_str]);
                    token_type = null;
                    token_first_letter = true;
                }
            }
        } else if((token_type == "Operator") || (token_type == "Identifier")) {
            if(identifierLetter(letter)) {
	        token_str += letter;
	    } else {
	        // console.log("...");
	        if(keywords.indexOf(token_str) != -1)
                    token_type = "KeyWord";
                if(types.indexOf(token_str) != -1)
                    token_type = "Type";
                if(tokens.length >= 2 && tokens[tokens.length-2][1] == "table")
                    token_type = "Name";
                tokens.push([token_type, token_str]);
                x--;
                token_type = null;
                token_first_letter = true;
                continue;
	    }
            if((x == line.length - 1) || is_there_next_letter) {
                if((x == line.length - 1) || (!identifierLetter(next_letter))) {
                    if(keywords.indexOf(token_str) != -1)
                        token_type = "KeyWord";
                    if(types.indexOf(token_str) != -1)
                        token_type = "Type";
                    if(tokens.length >= 2 && tokens[tokens.length-2][1] == "table")
                        token_type = "Name";
                    tokens.push([token_type, token_str]);
                    token_type = null;
                    token_first_letter = true;
                }
            }
        } else if(token_first_letter && (letter == ' ') && (next_letter == ' ') && (second_next_letter == ' ') && (line[x+3] == ' ')) {
            // working_as_intended
            // tokens.push(["Spacing_4", '    ']);
            x += 3;
        } else if(token_first_letter && (letter == '(') && (next_letter == ';')) {
            x += 1;
            tokens.push(["Long_comment_open_sign", '(;']);
        } else if(token_first_letter && (letter == ';') && (next_letter == ')')) {
            x += 1;
            tokens.push(["Long_comment_close_sign", ';)']);
        } else if(token_first_letter && (letter == ';') && (next_letter == ';')) {
            break;
            //x += 1;
            //tokens.push(["Comment_sign", ';;']);
        } else if(token_first_letter && (letter == '\ ')) {
            // working_as_intended
            if(spaces) {
                tokens.push(["Spacing", letter]);
            }
        } else {
            console.error("!", token_first_letter, letter);
        }
    }
    if(tokens.length && tokens_logger) {
        console.log("--------");
        for(var x of tokens)
            console.log(x[0], x[1]);
    }
    return tokens;
}

if(this.module) {
    module.exports = process;
}
