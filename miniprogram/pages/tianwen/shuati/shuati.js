// miniprogram/pages/tianwen/shuati/shuati.js
// const math = require("../../../math.js");
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    has_no_fill: 0,
    dialogShow: false,
    buttons: [{ text: "取消" }, { text: "确定" }],
    checkboxItems: [],
    questionResult: [],
    formData: {},
    time: 3600,
    question_class: "",
    question_index: 1,
    qusetion_order: 1,
    question_text: "",
    question_type: "",
    question_qty_all: 12,
    question_qty_need: 4,
    correct_array: [],
    question_array: [],
    current_answer: "",
    answer_array: [],
    error: "",
    per_type_qty: 1,
    loaddone: false,
    tips: "确认提交",
    typeandnum: [],
    input_focuses: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.order == "0") {
      wx.setNavigationBarTitle({
        title: "摸底测试",
      });
      this.setData({
        has_no_fill: 1,
        time: 3600,
      });
    } else {
      wx.setNavigationBarTitle({
        title: "知识检测（卷一）",
      });
      this.setData({
        has_no_fill: 0,
        time: 10200,
      });
    }
    //获取题目
    wx.showLoading({
      title: "题目加载中",
    });
    this.onFindQuestions(options.type, options.order);

    //设定计时器
    setTimeout(this.onTimeup, 500);
    //加载题目
    console.log("shuati onload");
    //设定答案
    setTimeout(this.createAnswer, 1000);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(app.globalData.timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  //数据库查询函数
  onFindQuestions: function (type, order) {
    wx.cloud.callFunction({
      name: "findQuestion",
      data: {
        type: type,
        order: order,
      },
      success: (res) => {
        console.log("[云函数] [findQuestion]", res);
        this.setData({
          questionResult: res.result.questions.data,
        });
        setTimeout(() => {
          wx.hideLoading();
        }, 1000);
        setTimeout(() => {
          this.setData({
            loaddone: true,
          });
        }, 1000);
      },
      fail: (err) => {
        console.error("[云函数] [findQuestion] 调用失败", err);
        wx.showToast({
          icon: "none",
          title: "查询记录失败",
        });
      },
    });
    const db = wx.cloud.database();
    // 查询
    db.collection("questions")
      .where({
        question_type: type,
        question_order: parseInt(order),
        is_delete: false,
      })
      .field({
        is_fill: true,
        _id: true,
        question_order: true,
        question_type: true,
        question_text: true,
        question_options: true,
        question_class: true,
        question_answer: true,
        jiexi: true,
        question_score: true,
      })
      .orderBy("is_fill", "asc")
      .get({
        success: (res) => {
          console.log(res);

          this.setData({
            questionResult: res.data,
          });
          setTimeout(() => {
            wx.hideLoading();
          }, 1000);
          setTimeout(() => {
            this.setData({
              loaddone: true,
            });
          }, 1000);
        },
        fail: (err) => {
          wx.showToast({
            icon: "none",
            title: "查询记录失败",
          });
        },
      });
  },

  splitQuestionClass(question_class) {
    let result = question_class.split("、");
    return result;
  },

  createTypeAndNum() {
    for (var t = 0; t < this.data.questionResult.length; t++) {
      let all_class = this.splitQuestionClass(
        this.data.questionResult[t].question_class
      );
      for (let i = 0; i < all_class.length; i++) {
        var index = this.data.typeandnum.findIndex(
          (index) => index.type === all_class[i]
        );
        if (index == -1) {
          this.data.typeandnum.push({
            type: all_class[i],
            num: 0,
          });
        }
      }
      console.log(this.data.typeandnum);
    }
  },
  getAnswerSmallPartCount(answer) {
    let parts = answer.split(".");
    if (parts.length == 2) {
      let smallPart = parts[1];
      return smallPart.length;
    }
    return 0;
  },
  isExpFormat(answer) {
    if (answer.split("e").length > 1) {
      //科学计算法1e3
      return true;
    } else if (answer.split("E").length > 1) {
      //科学计算法-1E3
      return true;
    } else {
      return false;
    }
  },
  getAnswerEpsion(answer) {
    let epsion = 0;
    if (!this.isExpFormat(answer)) {
      epsion = 1;
      let count = this.getAnswerSmallPartCount(answer);
      for (let i = 0; i < count; i++) {
        epsion /= 10;
      }
    }
    return epsion;
  },
  judgeAnswer() {
    //判卷
    var kou_num = 0; //扣分
    var all_num = 0; //总分

    app.globalData.wrong_question_array = []; //错题表
    this.createTypeAndNum(); //总类别
    // 总分
    for (var t = 0; t < this.data.questionResult.length; t++) {
      if (this.data.questionResult[t].is_fill) {
        for (
          var y = 0;
          y < this.data.questionResult[t].question_options.length;
          y++
        ) {
          all_num = all_num + this.data.questionResult[t].question_score;
        }
      } else {
        all_num = all_num + this.data.questionResult[t].question_score;
      }
    }
    for (var i = 0; i < this.data.questionResult.length; i++) {
      let question = this.data.questionResult[i];
      let all_class = this.splitQuestionClass(question.question_class);
      let tIndexArray = [];
      for (let ti = 0; ti < all_class.length; ti++) {
        //找问题类型
        var tindex = this.data.typeandnum.findIndex(
          (index) => index.type === all_class[ti]
        );
        tIndexArray.push(tindex);
      }
      if (!question.is_fill) {
        //选择题
        //找答案
        var index = this.data.answer_array.findIndex(
          (index) => index.index === i
        );
        if (index == -1) {
          //没回答
          app.globalData.wrong_question_array.push(question);
          kou_num = kou_num + question.question_score * 2; //倒扣分
          for (let ti = 0; ti < tIndexArray.length; ti++) {
            let tindex = tIndexArray[ti];
            this.data.typeandnum[tindex].num += 1;
          }
        } else {
          let user_answer = this.data.answer_array[index].val;
          if (question.question_answer != user_answer) {
            //答错了
            app.globalData.wrong_question_array.push(question);
            if (user_answer == "E" || user_answer == "e") {
              kou_num = kou_num + question.question_score; //不扣分
            } else {
              //不是我不确定
              kou_num = kou_num + question.question_score * 2; //倒扣分
            }

            for (let ti = 0; ti < tIndexArray.length; ti++) {
              let tindex = tIndexArray[ti];
              this.data.typeandnum[tindex].num += 1;
            }
          }
        }
      } else {
        //填空题
        var score = 0;
        let question_options = question.question_options;
        for (let rowIndex = 0; rowIndex < question_options.length; rowIndex++) {
          let step_option = question_options[rowIndex];
          if (step_option.fill == null) {
            //undefined，未答
            score += question.question_score; //不倒扣
          } else {
            let user_answer = step_option.fill.trim();
            let right_answer = step_option.text.trim();
            let formula = step_option.formula;
            let userFormula = false;
            if (formula && formula.trim().length > 0) {
              userFormula = true;
            }
            if (step_option.is_exp) {
              //科学计算法
              if (user_answer != right_answer) {
                score += question.question_score; //全扣
              }
            } else {
              //普通计算法
              let count = this.getAnswerSmallPartCount(right_answer); //正确答案小数位数
              let epsion = 1; //this.getEpsion(right_answer); //正确答案误差
              let f_right_answer = parseFloat(right_answer);
              let min_answer = (
                f_right_answer * Math.pow(10, count) -
                epsion
              ).toFixed(0);
              let max_answer = (
                f_right_answer * Math.pow(10, count) +
                epsion
              ).toFixed(0);
              if (count) {
                min_answer =
                  min_answer.slice(0, min_answer.length - count) +
                  "." +
                  min_answer.slice(min_answer.length - count);
                max_answer =
                  max_answer.slice(0, max_answer.length - count) +
                  "." +
                  max_answer.slice(max_answer.length - count);
              }
              //有配置公式，并且第一步有输入，第二步有输入
              if (
                userFormula &&
                ((rowIndex == 1 &&
                  question_options[0].fill &&
                  question_options[0].fill.trim().length > 0) ||
                  (rowIndex == 2 &&
                    question_options[0].fill &&
                    question_options[0].fill.trim().length > 0 &&
                    question_options[1].fill &&
                    question_options[1].fill.trim().length > 0))
              ) {
                if (user_answer == right_answer) {
                  //正确不扣分
                } else if (
                  user_answer == min_answer ||
                  user_answer == max_answer
                ) {
                  score += 1; //扣1分
                } else {
                  //算公式结果
                  let x1, y1;
                  if (rowIndex == 1) {
                    x1 = question_options[0].fill.trim();
                    formula = formula.replace(/x1/g, x1);
                  } else if (rowIndex == 2) {
                    x1 = question_options[0].fill.trim();
                    y1 = question_options[1].fill.trim();
                    formula = formula.replace(/x1/g, x1);
                    formula = formula.replace(/y1/g, y1);
                  }
                  let formula_answer = Math.round(
                    0 //math.evaluate(formula) * Math.pow(10, count)
                  );
                  let formula_min = (formula_answer - epsion).toFixed(0);
                  let formula_max = (formula_answer + epsion).toFixed(0);
                  formula_answer = formula_answer.toFixed(0);
                  if (count) {
                    formula_min =
                      formula_min.slice(0, formula_min.length - count) +
                      "." +
                      formula_min.slice(formula_min.length - count);
                    formula_max =
                      formula_max.slice(0, formula_max.length - count) +
                      "." +
                      formula_max.slice(formula_max.length - count);
                    formula_answer =
                      formula_answer.slice(0, formula_answer.length - count) +
                      "." +
                      formula_answer.slice(formula_answer.length - count);
                  }
                  if (user_answer == formula_answer) {
                    score += 2; //公式算完全正确，扣两分
                  } else if (
                    user_answer == formula_min ||
                    user_answer == formula_max
                  ) {
                    score += 3; //公式算有误差
                  } else {
                    score += question.question_score;
                  }
                }
              } else {
                if (user_answer == min_answer || user_answer == max_answer) {
                  score += 1; //扣1分
                } else if (user_answer != right_answer) {
                  score += question.question_score; //全扣
                }
              }
            }
          }
        }

        if (score != 0) {
          app.globalData.wrong_question_array.push(question);
          for (let ti = 0; ti < tIndexArray.length; ti++) {
            let tindex = tIndexArray[ti];
            this.data.typeandnum[tindex].num += 1;
          }
          // var tindex = this.data.typeandnum.findIndex(
          //   (i) => i.type === this.data.questionResult[index].question_class
          // );
          // this.data.typeandnum[tindex].num += 1;
        }
        kou_num += score;
      }
    }

    var sorttype = this.data.typeandnum;
    function sortData(a, b) {
      return b.num - a.num;
    }
    sorttype.sort(sortData);

    app.globalData.kou_num = kou_num;
    app.globalData.all_num = all_num;
    app.globalData.sorttype = sorttype;
    console.log(app.globalData.wrong_question_array);
    console.log(kou_num);
    console.log(all_num);
    console.log(app.globalData.sorttype);
  },

  //计时器函数
  onTimeup: function () {
    var time = this.data.time;
    app.globalData.timer = setInterval(() => {
      time--;
      if (time > 0) {
        if (time % 60 < 10) {
          if (Math.floor(time / 60) < 10) {
            this.setData({
              time: "0" + Math.floor(time / 60) + ":" + "0" + (time % 60),
            });
          } else {
            this.setData({
              time: Math.floor(time / 60) + ":" + "0" + (time % 60),
            });
          }
        } else {
          if (Math.floor(time / 60) < 10) {
            this.setData({
              time: "0" + Math.floor(time / 60) + ":" + (time % 60),
            });
          } else {
            this.setData({
              time: Math.floor(time / 60) + ":" + (time % 60),
            });
          }
        }
      } else {
        this.setData({
          time: "00:00",
        });
        this.judgeAnswer();
        wx.redirectTo({
          url: "../result/result",
        });
      }
    }, 1000);
  },

  //收集选择题答案
  boxChange: function (e) {
    var index = e.currentTarget.dataset.id;
    var item = {};
    var q_index = this.data.answer_array.findIndex((i) => i.index === index);
    var row = e.currentTarget.dataset.row;
    //清空checked
    for (
      var i = 0;
      i < this.data.questionResult[index].question_options.length;
      i++
    ) {
      this.data.questionResult[index].question_options[i].checked = false;
    }
    if (q_index == -1) {
      item["index"] = index;
      item["val"] = e.detail.value;
      this.data.answer_array.push(item);
    } else {
      this.data.answer_array[q_index].val = e.detail.value;
    }

    this.data.questionResult[index].question_options[row].checked = true;
    console.log(this.data.answer_array);
  },

  //收集填空题答案
  bindKeyInput: function (e) {
    console.log(e);

    let value = e.detail.value;
    // if (value.length) {
    //   if (e.currentTarget.dataset.id) {
    //     if (/^[0-9]$/.test(value)) {
    //       //不能有负号
    //       console.log("right");
    //     } else {
    //       value = "";
    //       console.log("wrong");
    //     }
    //   } else {
    //     if (/^[0-9-]$/.test(value)) {
    //       //可以有负号
    //       console.log("right");
    //     } else {
    //       value = "";
    //       console.log("wrong");
    //     }
    //   }
    // }

    var i = e.currentTarget.dataset.index;
    var row = e.currentTarget.dataset.row;

    var index = this.data.answer_array.findIndex(
      (i) => i.index === e.currentTarget.dataset.index
    );
    var str = this.data.answer_array[index].val[e.currentTarget.dataset.row]
      .k_val;
    var s = str.split("");
    s[e.currentTarget.dataset.id] = e.detail.value != "" ? e.detail.value : "0";
    var t = s.join("");

    this.data.answer_array[index].val[e.currentTarget.dataset.row].k_val = t;
    this.data.questionResult[i].question_options[row].fill = t;
    /*
    if (e.currentTarget.dataset.id < s.length - 1 && e.detail.value != "") {
      let focus_index;
      if (s[e.currentTarget.dataset.id + 1] == ".") {
        focus_index = e.currentTarget.dataset.id + 2;
      } else {
        focus_index = e.currentTarget.dataset.id + 1;
      }
      //if (s[focus_index] == "0")
      {
        let input_focuses = this.data.input_focuses;
        for (let t1 = 0; t1 < input_focuses.length; t1++) {
          for (let t2 = 0; t2 < input_focuses[t1].length; t2++) {
            for (let t3 = 0; t3 < input_focuses[t1][t2].focuses.length; t3++) {
              input_focuses[t1][t2].focuses[t3] = false;
            }
          }
        }
        input_focuses[i][row].focuses[focus_index] = true;
        this.setData({
          input_focuses: input_focuses,
        });
      }
    } else if (
      e.currentTarget.dataset.id == s.length - 1 &&
      e.detail.value != ""
    ) {
      let input_focuses = this.data.input_focuses;
      for (let t1 = 0; t1 < input_focuses.length; t1++) {
        for (let t2 = 0; t2 < input_focuses[t1].length; t2++) {
          for (let t3 = 0; t3 < input_focuses[t1][t2].focuses.length; t3++) {
            input_focuses[t1][t2].focuses[t3] = false;
          }
        }
      }
      this.setData({
        input_focuses: input_focuses,
      });
    }*/
    console.log(this.data.answer_array);
  },

  //提交
  onsubmit: function () {
    this.judgeAnswer();
    this.setData({
      tips: "检查完成，确认提交",
      dialogShow: true,
    });
  },

  //创建答题答案
  createAnswer: function () {
    var array = this.data.questionResult;
    var value = {};
    let has_fill = false;
    var input_focuses = this.data.input_focuses;
    for (var i = 0; i < array.length; i++) {
      if (!input_focuses[i]) {
        input_focuses[i] = [];
      }
      if (array[i].is_fill) {
        has_fill = true;
        var values = [];
        for (var j = 0; j < array[i].question_options.length; j++) {
          var str = array[i].question_options[j].text;
          var s = str.split("");
          var focuses = [];
          for (var k = 0; k < str.length; k++) {
            if (s[k] != ".") {
              s[k] = "0";
            }
            focuses[k] = false;
          }
          var t = s.join("");

          if (!input_focuses[i][j]) {
            input_focuses[i][j] = {};
          }
          input_focuses[i][j].focuses = focuses;
          value = { k_index: j, k_val: t };
          array[i].question_options[j];
          values.push(value);
        }
        this.data.answer_array.push({ index: i, val: values });
      }
    }
    if (has_fill) {
      this.setData({
        has_no_fill: 0,
      });
    } else {
      this.setData({
        has_no_fill: 1,
      });
    }
    this.setData({
      input_focuses: input_focuses,
    });
    console.log(this.data.answer_array);
  },
  //填空1
  fill1: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "28ee4e3e606c9f670e598c602be09828"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 0.8).toFixed(1) < -0.1 || (num - 0.8).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "0.8") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 3).toFixed(1) < -0.1 || (num - 3).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill != "3") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[2].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[2].fill);
      if ((num - 5.2).toFixed(1) < -0.1 || (num - 5.2).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[2].fill == "5.2") {
          if (kou_num > 1) {
            console.log("wewqe");
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //填空2
  fill2: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "28ee4e3e606c9f670e598c611fab7945"
    );
    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 29.7).toFixed(1) < -0.1 || (num - 29.7).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "29.7") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 42.0).toFixed(1) < -0.1 || (num - 42.0).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill != "42.0") {
          kou_num = kou_num + 1;
        }
      }
    }
    if (question.question_options[2].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[2].fill);
      if ((num - 71.7).toFixed(1) < -0.1 || (num - 71.7).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[2].fill == "71.7") {
          if (kou_num > 1) {
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    return kou_num;
  },

  //填空3
  fill3: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "28ee4e3e606c9f670e598c620ab4f002"
    );
    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 11.2).toFixed(1) < -0.1 || (num - 11.2).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "11.2") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 72.6).toFixed(1) < -0.1 || (num - 72.6).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill == "72.6") {
          if (kou_num > 1) {
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);

    return kou_num;
  },

  //填空4
  fill4: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "28ee4e3e606c9f670e598c63307ba11c"
    );
    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 29.8).toFixed(1) < -0.1 || (num - 29.8).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "29.8") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 20.1).toFixed(1) < -0.1 || (num - 20.1).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill != "20.1") {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);

    return kou_num;
  },

  //填空5
  fill5: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "28ee4e3e606c9f670e598c64079d32aa"
    );
    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if (
        (num - 0.947).toFixed(3) < -0.001 ||
        (num - 0.947).toFixed(3) > 0.001
      ) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "0.947") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 64.2).toFixed(1) < -0.1 || (num - 64.2).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill == "64.2") {
          if (kou_num > 1) {
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);

    return kou_num;
  },

  //填空6
  fill6: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "cbddf0af609ac85607dcacac4a96a726"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 6791).toFixed(1) < -0.1 || (num - 6791).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "6791") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if (
        (num - 7.663).toFixed(1) < -0.001 ||
        (num - 7.663).toFixed(1) > 0.001
      ) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill != "7.663") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[2].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[2].fill);
      if ((num - 92.8).toFixed(1) < -0.1 || (num - 92.8).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[2].fill == "92.8") {
          if (kou_num > 1) {
            console.log("wewqe");
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //填空7
  fill7: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "cbddf0af609ac85607dcacad26704620"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 5439).toFixed(1) < -0.1 || (num - 5439).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "5439") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if (
        (num - 7.198).toFixed(1) < -0.001 ||
        (num - 7.198).toFixed(1) > 0.001
      ) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill == "7.198") {
          if (kou_num > 1) {
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }

    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //填空8
  fill8: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "cbddf0af609ac85607dcacae4ae56be6"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 21.93).toFixed(1) < -0.01 || (num - 21.93).toFixed(1) > 0.01) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "21.93") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 10.63).toFixed(1) < -0.01 || (num - 10.63).toFixed(1) > 0.01) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill == "10.63") {
          if (kou_num > 1) {
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }

    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //填空9
  fill9: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "cbddf0af609ac85607dcacaf3c3f5789"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 154).toFixed(1) < -0.1 || (num - 154).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "154") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 3.4).toFixed(1) < -0.1 || (num - 3.4).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill != "3.4") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[2].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[2].fill);
      if ((num - 14.2).toFixed(1) < -0.1 || (num - 14.2).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[2].fill == "14.2") {
          if (kou_num > 1) {
            console.log("wewqe");
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //填空10
  fill10: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "cbddf0af609ac85607dcacb0157c07ef"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 4.15).toFixed(1) < -0.01 || (num - 4.15).toFixed(1) > 0.01) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "4.15") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 1.39).toFixed(1) < -0.01 || (num - 1.39).toFixed(1) > 0.01) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill != "1.39") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[2].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[2].fill);
      if ((num - 2.93).toFixed(1) < -0.01 || (num - 2.93).toFixed(1) > 0.01) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[2].fill == "2.93") {
          if (kou_num > 1) {
            console.log("wewqe");
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //填空11
  fill11: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "cbddf0af609ac85607dcacb144f657cf"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 2.2).toFixed(1) < -0.1 || (num - 2.2).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "2.2") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 9478).toFixed(1) < -0.1 || (num - 9478).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill == "9478") {
          if (kou_num > 1) {
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }

    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //填空12
  fill12: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "28ee4e3e606c9f670e598c602be09828"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 0.8).toFixed(1) < -0.1 || (num - 0.8).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "0.8") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 3).toFixed(1) < -0.1 || (num - 3).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill != "3") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[2].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[2].fill);
      if ((num - 5.2).toFixed(1) < -0.1 || (num - 5.2).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[2].fill == "5.2") {
          if (kou_num > 1) {
            console.log("wewqe");
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //填空13
  fill13: function () {
    var index = this.data.questionResult.findIndex(
      (i) => i._id === "28ee4e3e606c9f670e598c602be09828"
    );

    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;

    if (question.question_options[0].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[0].fill);
      if ((num - 0.8).toFixed(1) < -0.1 || (num - 0.8).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[0].fill != "0.8") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[1].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[1].fill);
      if ((num - 3).toFixed(1) < -0.1 || (num - 3).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[1].fill != "3") {
          kou_num = kou_num + 1;
        }
      }
    }

    if (question.question_options[2].fill == null) {
      kou_num = kou_num + 4;
    } else {
      var num = parseFloat(question.question_options[2].fill);
      if ((num - 5.2).toFixed(1) < -0.1 || (num - 5.2).toFixed(1) > 0.1) {
        kou_num = kou_num + 4;
      } else {
        if (question.question_options[2].fill == "5.2") {
          if (kou_num > 1) {
            console.log("wewqe");
            kou_num = kou_num + 2;
          }
        } else {
          kou_num = kou_num + 1;
        }
      }
    }
    if (kou_num != 0) {
      app.globalData.wrong_question_array.push(question);
      var tindex = this.data.typeandnum.findIndex(
        (i) => i.type === this.data.questionResult[index].question_class
      );
      this.data.typeandnum[tindex].num += 1;
    }
    console.log(kou_num);
    return kou_num;
  },

  //跳转 result 界面
  tapDialogButton(e) {
    this.setData({
      dialogShow: false,
    });
    if (e.detail.index == 1) {
      wx.redirectTo({
        url: "../result/result",
      });
    }
  },

  //test
  filljj1: function (qid) {
    var index = this.data.questionResult.findIndex((i) => i._id === qid);
    if (index == -1) {
      return 0;
    }

    var question = this.data.questionResult[index];
    var kou_num = 0;
    for (var i = 0; i < question.question_options.length; i++) {
      if (question.question_options[i].fill == null) {
        kou_num = kou_num + 4;
      } else {
        var num = parseFloat(question.question_options[0].fill);
        if (
          (num - 0.8).toFixed(1) < -0.1 ||
          (num - 0.8).toFixed(1) > 0.1 ||
          question.question_options[0].fill != "0.8"
        ) {
          kou_num = kou_num + 4;
        } else {
          if (question.question_options[0].fill != "0.8") {
            kou_num = kou_num + 1;
          }
        }
      }

      if (question.question_options[1].fill == null) {
        kou_num = kou_num + 4;
      } else {
        var num = parseFloat(question.question_options[1].fill);
        if (
          (num - 3).toFixed(1) < -0.1 ||
          (num - 3).toFixed(1) > 0.1 ||
          question.question_options[1].fill != "3"
        ) {
          kou_num = kou_num + 4;
        } else {
          if (question.question_options[1].fill != "3") {
            kou_num = kou_num + 1;
          }
        }
      }

      if (question.question_options[2].fill == null) {
        kou_num = kou_num + 4;
      } else {
        var num = parseFloat(question.question_options[2].fill);
        if (
          (num - 5.2).toFixed(1) < -0.1 ||
          (num - 5.2).toFixed(1) > 0.1 ||
          question.question_options[2].fill != "5.2"
        ) {
          kou_num = kou_num + 4;
        } else {
          if (question.question_options[2].fill == "5.2") {
            if (kou_num > 1) {
              kou_num = kou_num + 2;
            }
          } else {
            kou_num = kou_num + 1;
          }
        }
      }
      if (kou_num != 0) {
        app.globalData.wrong_question_array.push(question);
      }
    }
    return kou_num;
  },
});
