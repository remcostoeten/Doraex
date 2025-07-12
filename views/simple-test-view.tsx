'use client'

import { useState } from 'react'

export function SimpleTestView() {
	const [activeTab, setActiveTab] = useState('messages')

	const tabs = [
		{ id: 'assets', name: 'assets' },
		{ id: 'asset_categories', name: 'asset_categories' },
		{ id: 'messages', name: 'messages' },
	]

	return (
		<div className="bg-black text-white min-h-screen p-8">
			<h1 className="text-2xl mb-8">Tab Demo</h1>
			
			{/* Tab Container */}
			<div className="bg-neutral-900 rounded-lg overflow-hidden">
				{/* Tab Header */}
				<div className="flex border-b border-neutral-800">
					{tabs.map((tab) => (
						<div
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`
								relative flex items-center px-4 h-10 text-xs cursor-pointer transition-all
								${activeTab === tab.id 
									? 'bg-neutral-950 text-white border-b border-neutral-950' 
									: 'bg-transparent text-neutral-500 border-b border-neutral-800 hover:bg-neutral-800/50'
								}
							`}
						>
							{/* Active tab side borders */}
							{activeTab === tab.id && (
								<>
									<div className="absolute left-0 top-0 h-full w-px bg-neutral-800"></div>
									<div className="absolute right-0 top-0 h-full w-px bg-neutral-800"></div>
								</>
							)}
							
							{/* Tab Icon */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 256 256"
								className={`mr-2 ${activeTab === tab.id ? 'fill-white' : 'fill-neutral-500'}`}
							>
								<path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM216,64V96H40V64ZM40,160H80v32H40Zm176,32H96V160H216v32Z"></path>
							</svg>
							
							{/* Tab Name */}
							<span className={activeTab === tab.id ? 'font-medium' : ''}>
								{tab.name}
							</span>
							
							{/* Close Button */}
							<button
								onClick={(e) => {
									e.stopPropagation()
									console.log('Close tab:', tab.id)
								}}
								className={`
									ml-4 p-1 rounded transition-colors
									${activeTab === tab.id 
										? 'hover:bg-neutral-900' 
										: 'hover:bg-neutral-700'
									}
								`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 256 256"
									className="fill-neutral-400 hover:fill-white"
								>
									<path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
								</svg>
							</button>
						</div>
					))}
					
					{/* New Tab Button */}
					<button className="px-3 h-10 text-neutral-400 hover:text-white flex items-center text-xs">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 256 256"
							className="fill-current"
						>
							<path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
						</svg>
						<span className="ml-1">New</span>
					</button>
				</div>
				
				{/* Tab Content */}
				<div className="p-8">
					<div className="text-neutral-400">
						Active tab: <span className="text-white font-medium">{activeTab}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
