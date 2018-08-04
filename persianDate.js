module.exports = {
getTime : function () {
var days =["یکشنبه","دوشنبه","سه شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"]
var months = [
"فروردین",
"اردیبهشت",
"خرداد",
"تیر",
"مرداد",
"شهریور",
"مهر",
"آبان",
"آذر",
"دی",
"بهمن",
"اسفند"];
var miladiMonth=[31,28,31,30,31,30,31,31,30,31,30,31]
var shamsiMonth=[31,31,31,31,31,31,30,30,30,30,30,29]
var a = new Date()
var e = 0, b = 1930, c = a.getFullYear();
// 
for (var i = 1930; i <= c - 4; i += 4)
{
    // اضافه کردن یک دوره سال کبیسه
    b += 4;
    // اضافه کردن یک دوره برای برسی دوره ۸ ساله
    e += 1;
    //  
    if (e % 8 == 0) b++;
}
// اگر عدد به دست آمده‌ی ما با سال ورودی یکسان بود آن سال کبیسه می‌باشد در غیر اینصورت کبیسه نمی‌باشد
if(c==b) miladiMonth[1]=29
  var b =parseInt(a.getFullYear() -1 / 4)
  var d = 0;
  for(var i=0;i<a.getMonth();i++){
    d += miladiMonth[i]
  }
  var c = (((((a.getFullYear()-1)*365)+d)+a.getDate())+b)
  c -= 226899
  c = (c - (b - 155))
  c %= 365
  b=0
  for(i=0;c>=shamsiMonth[i];i++){
    c -=shamsiMonth[i]
    b++
  }
var allTime = {
  "dateDay" : c,
  "month" : months[b],
  "day" : days[a.getDay()],
  "time" : a.getHours() + ":" + a.getMinutes() + ":"+ a.getSeconds()
}
return allTime;
}
}