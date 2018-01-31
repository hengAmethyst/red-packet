// pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fcPhone: false,
    fcVerificationCode: false,
    fcPassword: false,
    fcInvitationCode: false,

    isPhoneFc: false,
    isVerificationCodeFc: false,
    isPasswordFc: false,
    isInvitationCodeFc: false,

    phone: '',
    verificationCode: '',
    password: '',
    invitationCode: '',

    txtGetVerificationCode: '获取',
    txtToggleDisplayPassowrd: '显示',

    hiddenPassword: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  handleFormSubmit() {

  },

  handleInputFocus(ev) {
    console.log('focus', ev);
    let name = ev.currentTarget.dataset.name;
    name = 'is' + name[0].toUpperCase() + name.substring(1) + 'Fc';
    this.setData({ [name]: true });
  },

  handleInputBlur(ev) {
    console.log('blur', ev);
    let name = ev.currentTarget.dataset.name;
    name = 'is' + name[0].toUpperCase() + name.substring(1) + 'Fc';
    this.setData({ [name]: false });
  },


  handleInputInput(ev) {
    console.log('input', ev);
    let name = ev.currentTarget.dataset.name;
    this.setData({ [name]: ev.detail.value });
  },

  handleGetVerificationCode() {
    if (this.data.txtGetVerificationCode != '获取') {
      return;
    }

    let countDown = () => {
      setTimeout(() => {
        let txt = this.data.txtGetVerificationCode;
        let second = Number(txt.substring(0, txt.length - 1));
        if (second > 1) {
          this.setData({ txtGetVerificationCode: (second - 1) + 's' }, countDown);
        } else {
          this.setData({ txtGetVerificationCode: '获取' });
        }
      }, 1000);
    };

    this.setData({ txtGetVerificationCode: '60s' }, countDown);
  },

  handleToggleDisplayPassword() {
    let hiddenPassword = !this.data.hiddenPassword;
    let txtToggleDisplayPassowrd = hiddenPassword ? '显示' : '隐藏';
    let fcPassword = true;
    this.setData({
      hiddenPassword,
      txtToggleDisplayPassowrd,
      fcPassword
    });
  },
})