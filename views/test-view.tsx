'use client'

import { useState } from 'react'

export function TestView() {
	const [activeTab, setActiveTab] = useState('messages')

	const tabs = [
		{ id: 'assets', name: 'assets', icon: 'table' },
		{ id: 'asset_categories', name: 'asset_categories', icon: 'table' },
		{ id: 'messages', name: 'messages', icon: 'table' },
	]

	return (
		<div className='font-[Inter,_Helvetica,_ui-sans-serif,_system-ui,_sans-serif,_"Apple_Color_Emoji",_"Segoe_UI_Emoji",_"Segoe_UI_Symbol",_"Noto_Color_Emoji"] text-white h-[1150px] text-sm bg-black overflow-hidden overscroll-none'>
			<div className='h-full z-[1] grow-[1] flex overflow-hidden flex-col overscroll-x-contain'>
				<div className='leading-[40px] h-10 flex justify-between'>
					<div className='h-full bg-neutral-900 grow-[1] flex overflow-hidden overscroll-x-contain'>
						<div className='relative overflow-hidden'>
							<div className='overflow-scroll size-full'>
								<div className='h-full min-w-full'>
									<div className='flex relative'>
										{tabs.map((tab) => (
											<div
												key={tab.id}
												onClick={() => setActiveTab(tab.id)}
												className={`relative flex items-center text-xs leading-[16px] h-10 cursor-pointer shrink-0 border-b ${
													activeTab === tab.id
														? 'text-white bg-neutral-950 border-b-neutral-950'
														: 'text-neutral-500 bg-transparent border-b-neutral-800 hover:bg-neutral-800/50'
												}`}
											>
												<div className='flex items-center justify-center px-4 h-full relative min-w-[160px] max-w-[240px]'>
													{activeTab === tab.id && (
														<>
															<div className='absolute h-full w-px bg-neutral-800 top-0 left-0'></div>
															<div className='absolute h-full w-px bg-neutral-800 top-0 right-0'></div>
														</>
													)}
													<span className='mr-1.5 flex items-center'>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															width='16'
															height='16'
															viewBox='0 0 256 256'
															className={`w-4 h-4 ${
																activeTab === tab.id ? 'fill-white' : 'fill-neutral-500'
															}`}
														>
															<path d='M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM216,64V96H40V64ZM40,160H80v32H40Zm176,32H96V160H216v32Z'></path>
														</svg>
													</span>
													<span
														className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap ${
															activeTab === tab.id ? 'font-medium' : ''
														}`}
													>
														{tab.name}
													</span>
													<button
														className={`ml-2 p-1 rounded-sm flex items-center justify-center transition-colors ${
															activeTab === tab.id
																? 'bg-neutral-950 hover:bg-neutral-900'
																: 'bg-neutral-900 hover:bg-neutral-800'
														}`}
														onClick={(e) => {
															e.stopPropagation()
															// Close tab logic here
														}}
													>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															width='12'
															height='12'
															viewBox='0 0 256 256'
															className='w-3 h-3 fill-neutral-300 hover:fill-white'
														>
															<path d='M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z'></path>
														</svg>
													</button>
												</div>
											</div>
										))}
											<div className='flex items-center justify-center px-4 h-full relative min-w-[160px] max-w-[240px]'>
												<span className='mr-1.5 flex items-center'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width='16'
														height='16'
														viewBox='0 0 256 256'
														className='fill-neutral-500 w-4 h-4'
													>
														<path
															d='M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM216,64V96H40V64ZM40,160H80v32H40Zm176,32H96V160H216v32Z'
														></path>
													</svg>
												</span>
												<span className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>
													asset_category_relations
												</span>
												<button className='ml-2 p-1 rounded-sm flex items-center justify-center transition-colors bg-neutral-900 hover:bg-neutral-800'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width='12'
														height='12'
														viewBox='0 0 256 256'
														className='w-3 h-3 fill-neutral-300 hover:fill-white'
													>
														<path
															d='M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z'
														></path>
													</svg>
												</button>
											</div>
										</div>
										<div className='relative flex items-center text-xs leading-[16px] h-10 cursor-pointer shrink-0 border-b text-white bg-neutral-950 border-b-neutral-950'>
											<div className='flex items-center justify-center px-4 h-full relative min-w-[160px] max-w-[240px]'>
												<div className='absolute h-full w-px bg-neutral-800 top-0 left-0'></div>
												<div className='absolute h-full w-px bg-neutral-800 top-0 right-0'></div>
												<span className='mr-1.5 flex items-center'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width='16'
														height='16'
														viewBox='0 0 256 256'
														className='fill-white w-4 h-4'
													>
														<path
															d='M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM216,64V96H40V64ZM40,160H80v32H40Zm176,32H96V160H216v32Z'
														></path>
													</svg>
												</span>
												<span className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-medium'>
													messages
												</span>
												<button className='ml-2 p-1 rounded-sm flex items-center justify-center transition-colors bg-neutral-950 hover:bg-neutral-900'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width='12'
														height='12'
														viewBox='0 0 256 256'
														className='w-3 h-3 fill-neutral-300 hover:fill-white'
													>
														<path
															d='M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z'
														></path>
													</svg>
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='border-b-neutral-800 border-b-[0.571429px] relative'>
							<button
								type='button'
								className='text-neutral-400 bg-transparent text-center cursor-pointer'
							>
								<div className='mt-[6px] ml-[6px] leading-[16px] h-7 text-xs flex font-medium justify-center items-center cursor-pointer p-[6px] gap-1 rounded-lg'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='16'
										height='16'
										viewBox='0 0 256 256'
										className='fill-neutral-400 stroke-[1px] overflow-hidden cursor-pointer size-4'
									>
										<path
											d='M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z'
											className='fill-neutral-400 stroke-[1px] inline cursor-pointer'
										></path>
									</svg>
									New
								</div>
							</button>
						</div>
						<div className='border-b-neutral-800 border-b-[0.571429px] grow-[1]'></div>
					</div>
				</div>
				<div className='grow-[1] flex relative overflow-hidden'>
					<div className='z-[1] grow-[1] flex absolute overflow-hidden flex-col inset-0'>
						<div className='flex flex-col size-full'>
							<div className='flex flex-col gap-3'>
								<div className='pr-2 pl-4 h-15 border-b-neutral-800 border-b-[0.571429px] grid-cols-3 bg-neutral-950 grid py-2 gap-3'>
									<div className='flex items-center'>
										<div className='relative'>
											<div>
												<div id='headlessui-popover-button-:r26:'>
													<button
														className='text-neutral-400 leading-[16px] w-max h-8 text-xs bg-transparent flex text-center font-medium flex-row-reverse justify-center items-center cursor-pointer mx-[2px] px-[10px] py-2 gap-2 rounded-md'
														id='add-filters-btn'
													>
														Add filters
														<svg
															xmlns='http://www.w3.org/2000/svg'
															width='16'
															height='16'
															viewBox='0 0 256 256'
															className='fill-neutral-400 stroke-[1px] overflow-hidden cursor-pointer size-4'
														>
															<path
																d='M198,136a6,6,0,0,1-6,6H64a6,6,0,0,1,0-12H192A6,6,0,0,1,198,136Zm34-54H24a6,6,0,0,0,0,12H232a6,6,0,0,0,0-12Zm-80,96H104a6,6,0,0,0,0,12h48a6,6,0,0,0,0-12Z'
																className='fill-neutral-400 stroke-[1px] inline cursor-pointer'
															></path>
														</svg>
													</button>
												</div>
											</div>
										</div>
									</div>
									<div className='min-w-0 grow-[1] flex'>
										<form className='leading-[24px] w-full flex relative justify-center items-center mx-auto gap-2'>
											<div className='grow-[1]'></div>
											<div className='relative overflow-hidden'>
												<div className='overflow-hidden invisible px-1'>
													messages
												</div>
												<input
													className='bg-transparent outline-transparent outline-[1.71429px] block absolute text-nowrap whitespace-nowrap text-ellipsis inset-0'
													value='messages'
												/>
											</div>
											<button
												type='button'
												className='text-neutral-400 bg-transparent block text-center cursor-pointer'
											>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width='1em'
													height='1em'
													viewBox='0 0 256 256'
													className='fill-neutral-400 stroke-[1px] overflow-hidden cursor-pointer size-4'
												>
													<path
														d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'
														className='fill-neutral-400 stroke-[1px] inline cursor-pointer'
													></path>
												</svg>
											</button>
											<div className='grow-[1]'></div>
										</form>
									</div>
									<div className='leading-[16px] text-xs flex items-center gap-[10px]'>
										<div className='grow-[1]'></div>
										<button
											className='text-neutral-200 w-max h-8 bg-neutral-800/74 flex text-center font-medium justify-center items-center cursor-pointer px-[10px] py-2 gap-2 rounded-md'
											id='add-row-btn'
										>
											Add Row
										</button>
										<button className='text-neutral-200 leading-[28px] text-xl bg-neutral-800/74 flex text-center font-medium justify-center items-center cursor-pointer gap-2 rounded-md size-8'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='16'
												height='16'
												viewBox='0 0 256 256'
												className='fill-neutral-200 stroke-[1px] overflow-hidden cursor-pointer size-4'
											>
												<path
													d='M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z'
													className='fill-neutral-200 stroke-[1px] inline cursor-pointer'
												></path>
											</svg>
										</button>
									</div>
								</div>
							</div>
							<div className='relative size-full'>
								<div className='absolute inset-0'>
									<div
										id='table-container'
										className='top-0 bottom-12 absolute inset-x-0'
									></div>
								</div>
								<div className='h-12 bottom-0 absolute inset-x-0'>
									<div className='w-full h-12 border-t-neutral-800 border-t-[0.571429px] bottom-0 bg-neutral-950 flex absolute items-center inset-x-0'>
										<div className='leading-[44px] grow-[1] flex items-center'>
											<div className='ml-2'>
												<div className='w-[129px] h-9 bg-neutral-900 relative rounded-lg'>
													<div className='mt-[3px] w-[43px] h-7 top-px left-1 bg-neutral-800 absolute rounded-sm'></div>
													<div className='top-1 flex absolute items-center gap-2 rounded-lg'>
														<div className='ml-1 leading-[28px] text-xs font-medium cursor-pointer px-2'>
															Data
														</div>
														<div
															id='table-view-toggle-group'
															className='text-neutral-400 leading-[28px] right-1 text-xs font-medium cursor-pointer px-2'
														>
															Structure
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className='text-[#c0c0c0] leading-[16px] h-12 text-xs grow-[1] flex text-right font-medium items-center'>
											<div className='mr-4 ml-auto text-zinc-50'></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
