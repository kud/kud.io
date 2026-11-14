// What the newsletter needs from an email provider, and nothing else. The
// routes and the workflow talk to this interface; resend.ts is the one
// implementation. Changing providers means writing another file like it.

import type { Lang } from "../sections.ts"

export type Message = { subject: string; html: string; text: string }

export interface NewsletterProvider {
  // A confirmed reader joins their language's list. Re-confirming is not an
  // error: the reader ends up subscribed, once, in that list.
  addSubscriber(email: string, lang: Lang): Promise<void>
  // One transactional message: the "please confirm" mail.
  sendTransactional(to: string, message: Message): Promise<void>
  // Has a campaign with this exact name already been created? The workflow's
  // guard against mailing the same edition twice.
  hasCampaign(name: string): Promise<boolean>
  // Send a campaign to one language's list now. `html` and `text` must carry
  // the provider's unsubscribe placeholder (`unsubscribePlaceholder`).
  sendCampaign(name: string, lang: Lang, message: Message): Promise<void>
  readonly unsubscribePlaceholder: string
}
