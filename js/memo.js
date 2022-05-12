// オートセーブ
// $(function() {
//     $(document).on('keyup', '#input_title', function(e) {
//         let a = $('#input_title').val();
//     });
//     $(document).on('keyup', '#input_memo', function(e) {
//         let b = $('#input_memo').val();
//     });
// });

// let removeClassElement = function(className){
//     let elements = document.getElementsByClassName(className);
//     for (let i = 0; i < elements.length; i++) {
//       let e = elements[i];
//       if (e) {
//         e.parentNode.removeChild(e);
//       }
//     }
// };

// function changeBackColor(){
//     var elements = document.getElementsByClassName('c1');
//     for(i=0;i<elements.length;i++){
//       elements[i].style.backgroundColor = "#00ff00";
//     }
// }

// inputジャンルの生成
const genres = ["エンタメ", "スポーツ", "ゲーム", "IT", "恋愛"];
let genres_length = genres.length;
for (let i = 0; i < genres_length; i++) {
    let html;
    let checked;
    if (i == 0) { checked = "checked"; } else { checked = ""; }
    html = `<input class="visually-hidden" type="radio" name="genre" value="${genres[i]}" id="genre${i}" ${checked}>
    <label for="genre${i}">${genres[i]}</label>`;
    $("#input_genre").append(html);
}


// ※ローカルストレージはインクリメントがないから順番がバラバラになる
// ページ読み込み：保存データ取得表示
for (let i = 0 ; i < localStorage.length ; i++) {
    let  values = JSON.parse(localStorage.getItem('m' + i)); 
    let html;
    if (values['key1'] != "delete") {
        let genre_index = check_genre_number(values['genre']);
        html =`
        <li id="${i}" class="list_item effect-fade">
        <div class="list_img"><img src="./img/sample.png" alt=""></div>
        <div class="list_text">
            <h3 id="list_title${i}" class="list_title">${values['title']}</h3>
            <span id="list_regist${i}" class="list_date">${values['regist']}</span><span>&nbsp;|&nbsp;</span><span id="list_genre${i}" class="list_genre${genre_index}">${values['genre']}</span>
        </div>
        </li>`;
    }
    $("#list_items").append(html);
}


//new クリックイベント 新規作成へ戻る
$("#new").on("click", function(){
    $('#valid').html("");

    $("#input_title").val("");
    $("#input_memo").val("");
    let element = document.getElementById( "genre0" ) ;
    element.checked = true ;
    $("#input_regist").html("");

    show_save_btn();
});


//Save クリックイベント 新規作成保存
$("#save").on("click", function(){
    $("#valid").html("");

    let items = new Object();
    let title = $("#input_title").val();
    let memo = $("#input_memo").val();
    items.title = title;
    items.memo = memo;
    items = check_trim(items);

    let genre = $('input:radio[name="genre"]:checked').val();
    let genre_index = check_genre_number(genre);
    let storage_length = localStorage.length;
    let now = get_now();

    if (check_validate(items)) {
        // OK
        let data = {
                key1 : storage_length,
                title: items['title'],
                memo : items['memo'],
                genre: genre,
                regist  : now,
                draft : "1",
            };
        localStorage.setItem('m'+storage_length, JSON.stringify(data)); 
        
        const html =`
        <li id="${storage_length}" class="list_item fadeUp">
        <div class="list_img"><img src="./img/sample.png" alt=""></div>
        <div class="list_text">
            <h3 id="list_title${storage_length}" class="list_title">${items['title']}</h3>
            <span id="list_regist${storage_length}" class="list_date">${now}</span><span>&nbsp;|&nbsp;</span>
            <span id="list_genre${storage_length}" class="list_genre">${genre}</span>
        </div>
        </li>`;
        $("#list_items").append(html);
        
        $("#input_title").val("");
        $("#input_memo").val("");

        let text = "保存しました";
        open_modal(text);
    } else {
        // NG
        let text = "<p>保存できませんでした</p>";
        let valid = $("#valid").html();
        text = text + valid;
        open_modal(text);
    }
});


//編集するための情報呼び出し
$(document).on("click", "#list_area #list_items li", function () {
    $('#valid').html("");

    hide_save_btn();

    // sort_genre();
    
    let id = $(this).attr('id');
    let values = JSON.parse(localStorage.getItem('m' + id)); 
    let genre_name = values['genre'];

    $("#input_title").val(values['title']);
    $("#input_memo").val(values['memo']);
    let index = check_genre_number(genre_name);
    let check = "genre"+index;
    let element = document.getElementById( check ) ;
    element.checked = true ;
    $("#input_regist").html("更新日: " + values['regist']);
    document.getElementById("hidden1").value = id;
});


//edit クリックイベント 編集保存
$("#edit").on("click", function(){
    $('#valid').html("");

    let id = document.getElementById("hidden1").value;
    let title = $("#input_title").val();
    let memo = $("#input_memo").val();

    let items = new Object();
    items.title = title;
    items.memo = memo;
    items = check_trim(items);

    let genre = $('input:radio[name="genre"]:checked').val();
    let now = get_now();

    if (check_validate(items)) {
        // OK
        let data = {
                key1 : id,
                title: items['title'],
                memo : items['memo'],
                genre: genre,
                regist  : now,
                draft : "1",
            };
        localStorage.setItem('m' + id, JSON.stringify(data)); 

        $("#input_title").val("");
        $("#input_memo").val("");
        $("#input_regist").html("");

        // listにすでにあるhtmlを編集
        $("#list_title"+id).html(items['title']);
        $("#list_memo"+id).html(items['memo']);
        $("#list_regist"+id).html(now);
        $("#list_genre"+id).html(genre);

        show_save_btn();

        let text = "保存しました";
        open_modal(text);
    } else {
        // NG
        let text = "<p>保存できませんでした</p>";
        let valid = $("#valid").html();
        text = text + valid;
        open_modal(text);
    }
    // 配列に重複があるかのチェック
    // if (setids.indexOf(setid) === -1) {
    //     setids.push(setid);
    // }
});


//delete クリックイベント 1行削除
// 論理削除
$("#delete").on("click", function(){
    let id = document.getElementById("hidden1").value;
    let values = JSON.parse(localStorage.getItem('m' + id));
    let data = {
            key1 : "delete",
            title: "",
            memo : "",
            genre: "",
        };
    localStorage.setItem('m' + id, JSON.stringify(data));

    $("#input_title").val("");
    $("#input_memo").val("");
    $("#input_regist").html("");

    $("li#"+id).addClass("hidden");
    let text = "削除しました";
    open_modal(text);

    show_save_btn();
});


//clear クリックイベント 全削除
// 物理削除
$("#clear").on("click", function(){
    if (localStorage.length === 0) {
        let text = "全て削除済みです";
        open_modal(text);
    } else {
        localStorage.clear();
        $("#list_area #list_items").empty();
        let text = "全て削除しました";
        open_modal(text);

        show_save_btn();
    }
});


// ソート機能未実装
function sort_genre() {
    let elements = document.getElementsByClassName('list_genre1');
    for(i=0;i<elements.length;i++){
        console.log(elements[i]);
        elements[i].style.display = "none";
    }
}

function show_save_btn() {
    $("#save").removeClass("hidden");
    $("#edit").addClass("hidden");
    $("#delete").addClass("hidden");
    $("#new").addClass("hidden");
}


function hide_save_btn() {
    $("#save").addClass("hidden");
    $("#edit").removeClass("hidden");
    $("#delete").removeClass("hidden");
    $("#new").removeClass("hidden");
}


function open_modal(text) {
    $("#modal__text").html(text);
    $('.js-modal').fadeIn();
}


// ジャンルの名前で何番目かを確認する
function check_genre_number(genre) {
    let genre_index = genres.indexOf(genre) ;
    return genre_index;
}


// 現在時刻の生成
function get_now() {
    let text = '';
    let now = new Date();

    let year = now.getFullYear();
    let month = now.getMonth();
    let date = now.getDate();
    let hour = now.getHours();
    let min = now.getMinutes();
    let sec = now.getSeconds();

    text = year + "/" + month + "/" + date + " " + hour + ":" + min + ":" + sec;
    return text;
}


// 先頭末尾の空白スペース削除
function check_trim(arr){
    arr["title"] = arr["title"].trim();
    arr["memo"] = arr["memo"].trim();
    return arr;
}


// バリデーション
function check_validate(arr){
    let valids = [];
    const valid_title = `<p class="error">タイトルを入力してください</p>`;
    const valid_memo = `<p class="error">内容を入力してください</p>`;

    if (arr['title']) {  } else { valids.push(valid_title); }
    if (arr['memo']) {  } else { valids.push(valid_memo); }
    // if ('title' in items) { console.log("aaa"); } else { valids.push(valid_title); } // キーの存在をチェック

    if (valids.length) {
        valids.forEach(function(elem, index) {
            $("#valid").append(elem);
        });
        return false;
    } else {
        // エラーなし
        return true;
    }
}

// modal
$(function(){
    $('.js-modal-open').on('click',function(){
        $('.js-modal').fadeIn();
        return false;
    });
    $('.js-modal-close').on('click',function(){
        $('.js-modal').fadeOut();
        return false;
    });
});

// ふわっと表示
window.onload = function() {
  scroll_effect();

  $(window).scroll(function(){
   scroll_effect();
  });

  function scroll_effect(){
   $('.effect-fade').each(function(){
    var elemPos = $(this).offset().top;
    var scroll = $(window).scrollTop();
    var windowHeight = $(window).height();
    if (scroll > elemPos - windowHeight){
     $(this).addClass('effect-scroll');
    }
   });
  }

};
