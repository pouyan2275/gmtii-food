$(document).ready(function(){
    $("#header").load("./header.html"); 
    $("#footer").load("./footer.html");
    $('#sefareshat').click(function(){
      $('#divFood').load("./table_sefaresh.html")
    });
    $('#foodPage').click(function(){
      $('#divFood').load("./edit_food.html")
    });
    $('#change_password_admin').click(function(){
      $('#divFood').load("./change_password.html")
    })
    $('#change_password_personal').click(function(){
      $('#divPersonal').load("./change_password.html")
    })
    $('#foods_personal').click(function(){
      $('#divPersonal').load("./reg_food.html")
    })
    $("#login_admin").click(function(){
      $.post("/admin",{username : $("#username").val(),password : $("#password").val()},function(data){
        if(data['msg'])
        swal("اخطار",data.msg,'error')
        else if(data['status'])
        location.href='/admin.html';
      })
    })
    $("#login_personal").click(function(){
      $.post("/personal",{code_p : $("#username").val(),password : $("#password").val()},function(data){
        if(data['msg'])
        swal("اخطار",data.msg,'error')
        else if(data['status'])
        location.href='/personal.html';
      })
    })
    $("#reg_personal").click(function(){
      $.post("/register",{
        "code_p" : $("#reg_cod").val(),
        "name" : $("#reg_name").val(),
        "family" : $("#reg_family").val(),
        "password" : $("#reg_password").val(),
        "authentication" : $("#reg_authentication").val(),
        "reg_post" : $("#reg_post").val()
      },function(data){
        if(data.status){
        $("#reg_cod").val("");$("#reg_name").val("");$("#reg_family").val("");$("#reg_password").val("");$("#reg_authentication").val("");
        swal(data.msg,"",'success')
      }else if(!data.status)
      swal("اخطار",data.msg,'error')
      })
    })

    $.post("/time",function(data){
      var interval = setInterval(function(){
        if($('#dateDay') && $('#month') && ('#day')){
        $('#dateDay').html(data.dateDay)
        $('#month').html(data['month'])
        $('#day').html(data['day'])
        clearInterval(interval)
        }
      },1000)
      var time = data['time']
      var countDownDate = new Date("Sep 5, 2018 "+ time).getTime();
      countDownDate -= 5513400000
      setInterval(function() {

        countDownDate += 1000;

        var distance = countDownDate;

        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById("time").innerHTML =  addZero(hours) + ":"
        + addZero(minutes)  + ":" + addZero(seconds) ;
    }, 1000);
    })
  })
  function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
  function importjs(path){
    var x = document.createElement('script')
    x.src = path
    document.head.appendChild(x)
  }