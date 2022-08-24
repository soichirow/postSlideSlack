'use strict'

class SlackApi {

  /**
   * slack API に関するコンストラクタ
   * @constructor
   */
  constructor() {
    /** @type {string} */
    //this.token = PropertiesService.getScriptProperties().getProperty('USER_OAUTH_TOKEN');
    /** @type {string} */
    this.token = PropertiesService.getScriptProperties().getProperty('BOT_USER_OAUTH_TOKEN');
  }

  /**
   * fetch メソッド用のパラメーターを生成するメソッド
   * @param {string} method - GET or POST メソッド。デフォルト引数は「POST」
   * @param {string} token - 利用するトークン。デフォルト引数は this.token
   * @return {Object} fetch メソッド用のパラメーター
   */
  getParams(method = 'POST', token = this.token) {
    const params = {
      method: method,
      headers: {
        Authorization: 'Bearer ' + token
      }
    };
    return params;
  }

  /**
   * fetch メソッド用のパラメーターを生成するメソッド。payloadを利用する場合。
   * @param {string} method - GET or POST メソッド。デフォルト引数は「POST」
   * @param {string} token - 利用するトークン。デフォルト引数は this.token
   * @param {string} payload - デフォルト引数は ""
   * @return {Object} fetch メソッド用のパラメーター
   */
  getParamAddPayload(method = 'POST', payload = "") {
    const params = {
      method: method,
      contentType: "application/x-www-form-urlencoded",
      payload: payload
    };
    return params;
  }

  /**
   * UrlFetchApp を利用して取得した値をオブジェクト化して返す関数
   * @param {string} url - fetch メソッド用の URL
   * @param {Object} params - fetch メソッド用のパラメーター
   */
  getAsObject(url, params) {
    const response = UrlFetchApp.fetch(url, params);
    const json = response.getContentText();
    const object = JSON.parse(json);
    return object;
  }
  /**
   * APIを使って単純なテキストメッセージを送信する。
   * APIドキュメント : https://api.slack.com/methods/chat.postMessage
   * 
   * @param {string} channel - channelのId
   * @param {string} text - 送信するメッセージ
   * @param {string} token - デフォルトはthis.botToken
   */
  postMessage(channel, text, token = this.botToken) {

    const url = "https://slack.com/api/chat.postMessage";
    const payload = {
      "token": token,
      "channel": channel,
      "text": text,
    };

    const params = this.getParamAddPayload("POST", payload)

    return this.getAsObject(url, params)
  }

  /**
   * APIを使ってブロックキットを使ってメッセージを送信する｡
   * APIドキュメント : https://api.slack.com/methods/chat.postMessage
   * 
   * @param {string} channel - channelのId
   * @param {string} blocksJson - 送信するメッセージ
   * @param {string} token - デフォルトはthis.botToken
   * @param {string} username - デフォルトは""
   */
  postBlokMessage(channel, blocksJson, token = this.botToken, username = "") {

    const url = "https://slack.com/api/chat.postMessage";

    const payload = {
      "token": token,
      "channel": channel,
      "blocks": JSON.stringify(blocksJson),
      "username": username
    };

    const params = this.getParamAddPayload("POST", payload)
    return this.getAsObject(url, params)
  }
  /**
   * APIを使って単純なテキストメッセージをスレッドに返信する｡
   * APIドキュメント : https://api.slack.com/methods/chat.postMessage
   * 
   * @param {string} channel - channelのId
   * @param {string} text - 送信するメッセージ
   * @param {string} threadTs - threadTs
   * @param {string} token - デフォルトはthis.botToken
   */
  postThreadMessage(channel, text, threadTs, token = this.botToken) {

    const url = "https://slack.com/api/chat.postMessage";
    const payload = {
      "token": token,
      "channel": channel,
      "text": text,
      "thread_ts": threadTs,
    };

    const params = this.getParamAddPayload("POST", payload)

    return this.getAsObject(url, params)
  }
  /**
   * APIを使ってメッセージを更新する｡
   * APIドキュメント : https://api.slack.com/methods/chat.postMessage
   * 
   * @param {string} channel - channelのId
   * @param {string} text - 送信するメッセージ
   * @param {string} text - タイムスタンプ
   * @param {string} blocksJson - 送信するメッセージ
   * @param {string} token - デフォルトはthis.botToken
   * @param {string} username - デフォルトは""
   */
  updateBlokMessage(channel, blocksJson, ts, token = this.botToken, username = "") {

    const url = "https://slack.com/api/chat.update";

    const payload = {
      "token": token,
      "channel": channel,
      "ts": ts,
      "blocks": JSON.stringify(blocksJson),
      "username": username
    };

    const params = this.getParamAddPayload("POST", payload)
    return this.getAsObject(url, params)
  }

  /**
   * メッセージにリアクションを追加します。
   * 
   */
  reactionsAdd(channel ,name = "sumi",timestamp) {
    const url = 'https://slack.com/api/reactions.add';

    const token = this.token;
    const payload = {
      token: token,
      channel: channel,
      name:name,
      timestamp:timestamp
    };
    const params = {
      method: "POST",
      payload: payload
    };

    const json = UrlFetchApp.fetch(url, params).getContentText();
    const object = JSON.parse(json);
    return object;

  }



  /**
   * APIを使ってファイルをアップロードする
   * APIドキュメント : https://api.slack.com/methods/files.upload
   * 
   * @param {string} channels - channelのId
   * @param {string} initialComment - 送信するメッセージ
   * @param {string} imgTitle - 画像のタイトル
   * @param {string} blobImage - 送信するメッセージ
   * @return {object} object
   */
  filesUpload(channels , initialComment , imgTitle = 'image', blobImage) {
    const url = 'https://slack.com/api/files.upload'

    const token = this.token
    const payload = {
      token: token,
      file: blobImage,
      channels: channels,
      title: imgTitle,
      initial_comment: initialComment
    };
    const params = {
      method: "POST",
      payload: payload
    };

    const json = UrlFetchApp.fetch(url, params).getContentText();
    const object = JSON.parse(json);
    return object;
  }
  /**
   * 
   */
  getBlob(imgUrl ) {
    const blob = UrlFetchApp.fetch(imgUrl).getBlob();
    return blob
  }

  /**
   * doPost(e)で受け取った中身からbutunのvalueを取得して返します
   * @param  {object} e - 受け取った中身
   * @return {string} actionsValue - buttunの中身
   */
  getFromElementsActionsValue(e) {
    const json = JSON.parse(e.parameter.payload);
    const actionsValue = json.actions[0].value;
    return actionsValue
  }
  /**
   * doPost(e)で受け取った中身からUserIdを取得して返します
   * @param  {object} e - 受け取った中身
   * @return {string} UserId - UserId
   */
  getFromElementsUserId(e) {
    const json = JSON.parse(e.parameter.payload);
    const userId = json.user.id
    return userId
  }
  /**
   * doPost(e)で受け取った中身から userName を取得して返します
   * @param  {object} e - 受け取った中身
   * @return {string} userName - userName
   */
  getFromElementsUserName(e) {
    const json = JSON.parse(e.parameter.payload);
    const userName = json.user.username
    return userName
  }

  /**
   * doPost(e)で受け取った中身からResponseUrlを取得して返します
   * @param  {object} e - 受け取った中身
   * @return {string} ResponseUrl - ResponseUrl
   */
  getFromElementsResponseUrl(e) {
    const json = JSON.parse(e.parameter.payload);
    const responseUrl = json.response_url;
    return responseUrl
  }
  /**
   * doPost(e)で受け取った中身からoriginalTextを取得して返します
   * @param  {object} e - 受け取った中身
   * @return {string} originalText - originalText
   */
  getFromElementsOriginalText(e) {
    const json = JSON.parse(e.parameter.payload);
    const originalText = json.message.blocks[0].text.text;
    return originalText
  }
  /**
   * doPost(e)で受け取った中身からmessageTsを取得して返します
   * @param  {object} e - 受け取った中身
   * @return {string} messageTs - messageTs
   */
  getFromElementsMessageTs(e) {
    const json = JSON.parse(e.parameter.payload);
    const messageTs = json.message.ts;
    return messageTs
  }
  /**
   * doPost(e)で受け取った中身から channelId を取得して返します
   * @param  {object} e - 受け取った中身
   * @return {string} channelId - channelId
   */
  getFromElementsChannelId(e) {
    const json = JSON.parse(e.parameter.payload);
    const channelId = json.container.channel_id;
    return channelId
  }
}