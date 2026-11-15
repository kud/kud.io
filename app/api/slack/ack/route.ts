// Slack's interactivity Request URL for the workspace's notification app.
// Its messages carry link buttons only: the link opens on its own, and Slack
// still posts each click here, flagging the button unless something answers.
// Nothing is read or stored; the 200 is the whole job.
export const POST = () => new Response(null, { status: 200 })
