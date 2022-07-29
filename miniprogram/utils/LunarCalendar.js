var LunarCalendar = {
  /**
  * 农历1900-2100的闰大小信息表
  * 例如：0x04bd8 相当于 0000 0100 1011 1101 1000      19位 --->  0位
  * 第0-3位代表 是否是闰月，如果全为0代表不闰月，否则代表闰月的月份。
  * 第15-4位代表从1月到12月是大月还是小月，大月30天，小月29天。
  * 后4位代表的是闰月是大月还是小月 0为小1为大。
  * 2033年的数据网上流传的是0x04bd7 其实应该是0x04afb
  */
  lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, //1900-1909
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, //1910-1919
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, //1920-1929
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, //1930-1939
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, //1940-1949
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, //1950-1959
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, //1960-1969
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, //1970-1979
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, //1980-1989
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, //1990-1999
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, //2000-2009
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, //2010-2019
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, //2020-2029
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, //2030-2039
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, //2040-2049
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, //2050-2059
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, //2060-2069
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, //2070-2079
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, //2080-2089
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, //2090-2099
    0x0d520 //2100
  ],
  /**
  * 公历每个月份的天数普通表
  */
  solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  /**
  * 天干地支之天干速查表
  */
  Gan: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
  /**
  * 天干地支之地支速查表
  */
  Zhi: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
  /*
  * 计算天干地支季月使用
  * "甲": [2, 2]  表示 甲年的第一个月(立春)是丙寅月
  */
  monthTD: {
    "甲": [2, 2], "乙": [4, 2], "丙": [6, 2], "丁": [8, 2], "戊": [0, 2], "己": [2, 2], "庚": [4, 2], "辛": [6, 2], "壬": [8, 2], "癸": [0, 2]
  },
  /**
  * 生肖
  */
  Animals: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],
  /**
  * 24节气速查表
  */
  solarTerm: ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满",
    "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪",
    "大雪", "冬至"
  ],
  /**
  * 24节气速查表,每种节气的计算数据
  */
  sTermInfo: [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693,
    263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758
  ],
  /**
  * 日期转农历称呼速查表
  */
  lunarDayStrFirst: ['初', '十', '廿', '卅'],
  lunarDayStrLast: ["十", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
  /**
  * 星期称呼速查表
  */
  Week: ["一", "二", "三", "四", "五", "六", "日"],
  /**
  * 月份转农历称呼速查表
  */
  lunarMonthStr: ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "腊"],
  /**
  * 农历节日
  */
  lunarFestival: {
    "1-1": "春节",
    "1-15": "元宵节",
    "5-5": "端午节",
    "7-7": "乞巧节",
    "8-15": "中秋节",
    "9-9": "重阳节",
    "12-8": "腊八节",
    "12-24": "小年" // 有的是23小年 有的算24小年
  },
  /**
  * 公历节日
  */
  gregorianFestival: {
    "1-1": "元旦",
    "3-8": "妇女节",
    "3-12": "植树节",
    "5-1": "劳动节",
    "5-4": "青年节",
    "6-1": "儿童节",
    "7-1": "建党节",
    "8-1": "建军节",
    "9-10": "教师节",
    "10-1": "国庆节"
  },
  /*
  * 返回农历Y年的天数、闰月信息和每个月的信息
  */
  getLunarYearDays: function (Y) {
    var sum = 348;
    var lunarMonth = new Array();
    var leapMonth = [0, 0];
    var flag = 0;
    var temp = 0x8000
    for (i = 0; i < 12; i += 1) {
      flag = (calendar.lunarInfo[Y - 1900] & temp) ? 1 : 0;
      lunarMonth[i] = flag;
      sum += flag;
      temp >>= 1
    }
    leapMonth = calendar.getLunarMonth(Y);
    sum += leapMonth[1];
    return {
      sum: sum,
      leapMonth: leapMonth,
      lunarMonth: lunarMonth
    };
  },
  /*
  * 判断今年是否有闰月  闰月是大月还是小月
  */
  getLunarMonth: function (Y) {
    if (calendar.lunarInfo[Y - 1900] & 0xf) {
      return [calendar.lunarInfo[Y - 1900] & 0xf, (calendar.lunarInfo[Y - 1900] & 0x10000) ? 30 : 29];
    }
    return [0, 0];
  },
  /*
  * 获取1900(1900-01-31)年春节到的Y-M-D的阳历日期
  */
  gregorianCalendar: function (Y, M, D) {
    var sum = 0;
    for (var i = 1900; i < Y; i += 1) {
      if (i % 400 == 0 || (i % 100 != 0 && i % 4 == 0)) sum += 366;
      else sum += 365;
    }
    for (var i = 0; i < M - 1; i += 1) sum += calendar.solarMonth[i];
    if ((M > 2) && (Y % 400 == 0 || (Y % 100 != 0 && Y % 4 == 0))) sum += 1;
    sum += D - 1;
    return sum - 30;
  },
  /*
  * 获取1900年春节到的Y的阴历日期
  */
  lunarCalendar: function (Y, M, D) {
    var sum = 0;
    var temp = null;
    for (var i = 1900; i < Y; i += 1) {
      temp = calendar.getLunarYearDays(i);
      sum += temp.sum;
    }
    temp = calendar.getLunarYearDays(Y);
    for (var i = 0; i < M - 1; i++) sum += temp.lunarMonth[i] == 0 ? 29 : 30;
    if (temp.leapMonth[0] < M) sum += temp.leapMonth[1];
    sum += D - 1;
    return sum;
  },
  /*
  * 将阳历转换为阴历
  */
  calendarConvert: function (Y, M, D) {
    var num = calendar.lunarCalendar(Y, M, D) - calendar.gregorianCalendar(Y, M, D);
    var demo = calendar.getLunarYearDays(Y);
    var result = 0;
    if (D > num) return [0, Y, M, (D - num)];
    M -= 1;
    if (M == 0) {
      M = 12; Y -= 1;
      demo = calendar.getLunarYearDays(Y);
    }
    if (M == demo.leapMonth[0]) result = 1;
    if (D == num) return [result, Y, M, demo.lunarMonth[M - 1] == 0 ? 29 : 30];
    if (num > D) num -= D;
    while (true) {
      var temp = 0;
      if (demo.leapMonth[0] == M && result == 1) {
        temp = demo.leapMonth[1];
      } else {
        temp = demo.lunarMonth[M - 1] == 0 ? 29 : 30;
      }
      if (temp > num) { num = temp - num; break; }
      num -= temp;
      if (num == 0) {
        if (demo.leapMonth[0] == M && result == 1) {
          num = demo.lunarMonth[M - 1] == 0 ? 29 : 30;
          result = 0;
        } else {
          M -= 1;
          if (M == 0) {
            M = 12; Y -= 1;
            demo = calendar.getLunarYearDays(Y);
          }
          if (demo.leapMonth[0] == M) {
            result = 1;
            num = demo.leapMonth[1];
          }
          else {
            num = demo.lunarMonth[M - 1] == 0 ? 29 : 30;
          }
        }
        break;
      }
      if (demo.leapMonth[0] == M && result == 1) result = 0;
      else {
        M -= 1;
        if (M == 0) {
          Y -= 1;
          M = 12;
          demo = calendar.getLunarYearDays(Y);
        }
        if (demo.leapMonth[0] == M) result = 1;
      }
    }
    return [result, Y, M, num];
  }
};

module.exports = LunarCalendar;