import Messages from '../models/message_model'
export type chatProps = {
	senderID?: string
	body?: string
	username?: string
	time?: string
}
const getMessages = async () => {
	return Messages.find()
}
const createMessage = async (data: chatProps) => {
	const message = new Messages(data)
	await message.save()
	return message
}
export { getMessages, createMessage }