"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	useRealtimeData,
	useDatabaseOperations,
} from "@/hooks/use-realtime-db";

interface Message {
	id: string;
	text: string;
	timestamp: number;
	author: string;
}

export default function ExampleRealtimeDB() {
	const [messageText, setMessageText] = useState("");
	const [authorName, setAuthorName] = useState("");

	// Real-time listener for messages
	const {
		data: messages,
		loading: messagesLoading,
		error: messagesError,
	} = useRealtimeData<Record<string, Message>>("/messages");

	// Database operations hook
	const {
		loading: operationLoading,
		error: operationError,
		addToList,
		removeData,
	} = useDatabaseOperations();

	const handleSendMessage = async () => {
		if (!messageText.trim() || !authorName.trim()) return;

		try {
			const message: Omit<Message, "id"> = {
				text: messageText.trim(),
				timestamp: Date.now(),
				author: authorName.trim(),
			};

			await addToList("/messages", message);
			setMessageText("");
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const handleDeleteMessage = async (messageId: string) => {
		try {
			await removeData(`/messages/${messageId}`);
		} catch (error) {
			console.error("Failed to delete message:", error);
		}
	};

	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	if (messagesLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center">Loading messages...</div>
				</CardContent>
			</Card>
		);
	}

	if (messagesError) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-red-500">
						Error loading messages: {messagesError.message}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Firebase Realtime Database Example</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							placeholder="Your name"
							value={authorName}
							onChange={(e) => setAuthorName(e.target.value)}
							className="flex-1"
						/>
					</div>
					<div className="flex gap-2">
						<Input
							placeholder="Type your message..."
							value={messageText}
							onChange={(e) => setMessageText(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
							className="flex-1"
						/>
						<Button
							onClick={handleSendMessage}
							disabled={
								operationLoading || !messageText.trim() || !authorName.trim()
							}
						>
							Send
						</Button>
					</div>

					{operationError && (
						<div className="text-red-500 text-sm">
							Operation error: {operationError.message}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Real-time Messages</CardTitle>
				</CardHeader>
				<CardContent>
					{messages && Object.keys(messages).length > 0 ? (
						<div className="space-y-3">
							{Object.entries(messages)
								.sort(([, a], [, b]) => b.timestamp - a.timestamp)
								.map(([id, message]) => (
									<div
										key={id}
										className="flex items-start justify-between p-3 border rounded-lg"
									>
										<div className="flex-1">
											<div className="font-medium text-sm">
												{message.author}
											</div>
											<div className="text-sm text-gray-600">
												{message.text}
											</div>
											<div className="text-xs text-gray-400 mt-1">
												{formatTimestamp(message.timestamp)}
											</div>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteMessage(id)}
											disabled={operationLoading}
											className="ml-2"
										>
											Delete
										</Button>
									</div>
								))}
						</div>
					) : (
						<div className="text-center text-gray-500 py-8">
							No messages yet. Send the first one!
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
