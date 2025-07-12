import React from 'react'
import { Send, Search } from 'lucide-react'

export default function MessagesView() {
	return (
		<div className='flex-1 bg-neutral-950 text-neutral-50'>
			{/* Header */}
			<div className='bg-neutral-950 border-b border-neutral-800 p-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-semibold'>Messages</h2>
					<div className='relative'>
						<Search
							className='absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400'
							size={16}
						/>
						<input
							type='text'
							placeholder='Search messages...'
							className='pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-50 placeholder-neutral-400 focus:outline-none focus:border-neutral-500'
						/>
					</div>
				</div>
			</div>

			{/* Messages Area */}
			<div className='flex-1 p-4'>
				<div className='space-y-4'>
					<div className='bg-neutral-900 rounded-lg p-4'>
						<div className='flex items-start space-x-3'>
							<div className='w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center text-neutral-50 text-sm'>
								U
							</div>
							<div className='flex-1'>
								<div className='flex items-center space-x-2 mb-1'>
									<span className='text-sm font-medium'>
										User
									</span>
									<span className='text-xs text-neutral-400'>
										2 minutes ago
									</span>
								</div>
								<p className='text-sm text-neutral-300'>
									Welcome to the cyber tab system! This
									demonstrates dynamic tab management.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Message Input */}
			<div className='border-t border-neutral-800 p-4'>
				<div className='flex items-center space-x-3'>
					<input
						type='text'
						placeholder='Type a message...'
						className='flex-1 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-50 placeholder-neutral-400 focus:outline-none focus:border-neutral-500'
					/>
					<button className='p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-50 transition-colors'>
						<Send size={16} />
					</button>
				</div>
			</div>
		</div>
	)
}
