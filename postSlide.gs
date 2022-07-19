'use strict'
/**
 * メインの関数。
 * スプレッドシートに適当な画像を設置してそこに関数を紐づける想定。
 */
function postSlide() {

  const slideSheet = new SlidePost()

  //スライドをSlackに投稿する。
  const postResult = slideSheet.postMsg()

  //slackの投稿にスタンプをつける。
  slideSheet.reactionsAdd(postResult)

  //完了を書き込む
  slideSheet.success()

  return
}

/**
 * 
 */
class SlidePost {
  /**
   * @constructor
   */
  constructor() {
    this.URL = PropertiesService.getScriptProperties().getProperty('SLIDE_SHEET_URL');
    this.CHANNLEL_NAME_HEADDER_NAME = 'flug'
    this.slack = new SlackApi()
    this.slackSetting = new SlackSetting()
    this.channelId = this.slackSetting.getChanneId()

    this.sheet = new Sheet(Sheet.getByUrl(this.URL))
  }

  /**
   * Slideを投稿するメソッド
   * @return {object} - postResult
   */
  postMsg() {
    const targetDict = this.getTargetDict_()
    const channels = this.channelId
    const initialComment = targetDict.get("postText")
    const imgTitle = targetDict.get("imgTitle")
    const blobImage = this.getSlideBlob()

    const postResult = this.filesUpload(channels, initialComment, imgTitle, blobImage)
    return postResult
  }

  /**
   * 対象のメッセージにリアクションを追加するメソッド(::は不要)
   * @param {object} - postResult
   * @return {array.<object>} - reactionResultList
   */
  reactionsAdd(postResult) {
    const targetDict = this.getTargetDict_()
    const stampList = targetDict.get("stamp").split(",")
    const channel = this.channelId

    const timestamp = this.getTimestamp(postResult)
    const reactionResultList = stampList.map(stamp => {
      const reactionResult = this.slack.reactionsAdd(channel, stamp, timestamp)
      return reactionResult
    })

    return reactionResultList
  }

  /**
   * スプレッドシートに投稿完了と書き込む。
   */
  success() {
    const dataValues = this.sheet.getDataValues()
    const flugColIndex = this.sheet.getColumnIndexByHeaderName("flug")
    for (let cnt = 0; cnt < dataValues.length; cnt++) {
      if (dataValues[cnt][flugColIndex] === ""){
        dataValues[cnt][flugColIndex] = "投稿完了"
        this.sheet.setValuesHeaderRowsAfter(dataValues)
        this.sheet.flush()
        break
      }
    }
    return

  }

  /**
   * postResult からタイムスタンプを取得するメソッド。
   * @param {object} - postResult
   * @return {string} - timestamp
   */
  getTimestamp(postResult) {
    const publicObj = postResult.file.shares["public"] // 予約語でpublicを使えないため文字列で指定
    const channelKey = Object.keys(publicObj)[0]
    const timestamp = publicObj[channelKey][0].ts
    return timestamp

  }

  /**
   * SlackApiクラスから移譲されたメソッド
   * 
   */
  filesUpload(channels, initialComment, imgTitle, blobImage) {
    return this.slack.filesUpload(channels, initialComment, imgTitle, blobImage)
  }

  /**
   * スプレッドシートから投稿対象となるSlideを取得して、blobに変換して返します。
   * @return {blob} - blobImag
   */
  getSlideBlob() {
    const targetDict = this.getTargetDict_()
    const slideUrl = targetDict.get("url")
    const getImageFetchUrl = this.getImageFetchUrl_(slideUrl)

    const options = this.getOptions_()
    const response = UrlFetchApp.fetch(getImageFetchUrl, options);
    const blobImag = response.getResponseCode() === 200 ? response.getBlob() : new Error("画像の生成に失敗しました。");

    return blobImag
  }

  /**
   * 
   * @return {array} - record
   * @private
   */
  getTargetDict_() {
    const header = this.CHANNLEL_NAME_HEADDER_NAME
    const value = "" //flugの欄が空文字のものを処理対象とする。
    const targetDict = this.sheet.findDict(header, value)
    return targetDict
  }

  /**
   * @param {strign} - slideUrl
   * @param {strign} - format デフォルトはpng
   * @return {string} - imageFetchUrl
   * @private
   */
  getImageFetchUrl_(slideUrl, format = 'png') {
    const presentationId = this.getPresentationId_(slideUrl);
    const pageId = this.getPageId_(slideUrl)
    const imageFetchUrl = `https://docs.google.com/presentation/d/${presentationId}/export/${format}?id=${presentationId}&pageid=${pageId}`;
    return imageFetchUrl
  }
  /**
   * 
   * @param {string} - slideUrl
   * @return {string} - presentationId
   * @private
   */
  getPresentationId_(slideUrl) {
    const presentation = SlidesApp.openByUrl(slideUrl);
    const presentationId = presentation.getId();
    return presentationId
  }
  /**
   * 
   * @return {string} - pageId
   * @private
   */
  getPageId_(slideUrl) {
    const regex = new RegExp(/(?<=slide=id\.).*$/)

    const pageId = regex.test(slideUrl) === true ? slideUrl.match(regex)[0] : new Error(`URLの形式が不正です。slideUrl:${slideUrl}`);
    return pageId
  }

  /**
   * 
   * @return {object} - options
   * @private
   */
  getOptions_() {
    const options = {
      method: "get",
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };
    return options
  }

}




class SlackSetting {
  /**
   * @constructor
   */
  constructor() {

    this.URL = PropertiesService.getScriptProperties().getProperty('SLIDE_SETTING_SHEET_URL');
    this.CHANNLEL_NAME_HEADDER_NAME = 'チャンネルID'
    this.sheet = new Sheet(Sheet.getByUrl(this.URL))
    this.data = this.sheet.getDataValues()
  }
  /**
   * 設定シートからSlackのIDを取得するメソッド
   * 
   * @return {string} - channelId
   */
  getChanneId() {
    if (this.channelId_ !== undefined) return this.channelId_
    const channelId = this.data[0][this.getChanneIdIndex_()]
    this.channelId_ = channelId

    return channelId
  }
  /**
   * 
   * @return {string} - channeIdIndex
   * @private
   */
  getChanneIdIndex_() {
    const channeIdIndex = this.sheet.getColumnIndexByHeaderName(this.CHANNLEL_NAME_HEADDER_NAME)
    return channeIdIndex
  }
}


