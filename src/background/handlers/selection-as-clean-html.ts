import { plainText } from './utils.js'
import { createTabClient } from '@delight-rpc/webextension'
import { IFrameAPI } from '@src/contract.js'
import { CommandHandler } from './types.js'
import { pipeAsync } from 'extra-utils'
import { offscreen } from '@background/offscreen-client.js'
import { formatHTML } from '@utils/format-html.js'
import { getConfig } from '@background/storage.js'

export const commandSelectionAsCleanHTML: CommandHandler = async (info, tab) => {
  if (tab.id) {
    const baseURL = info.frameUrl ?? info.pageUrl ?? tab.url

    if (baseURL) {
      const config = await getConfig()
      const tabClient = createTabClient<IFrameAPI>({
        tabId: tab.id
      , frameId: info.frameId
      })
      const html = await tabClient.getSelectionHTML()

      return plainText(
        await pipeAsync(
          html
        , offscreen.sanitizeHTML
        , html => offscreen.formatURLsInHTML(html, baseURL, config.url)
        , html => offscreen.cleanHTML(html, config.html.cleanHTML)
        , html => config.html.formatHTML ? formatHTML(html) : html
        )
      )
    }
  }
}
