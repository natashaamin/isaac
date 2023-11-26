import { Dialog } from '@components/ui/dialog';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@components/ui/tooltip';
import { Panel, useUIStore } from '@context/ui.store';
import { useUser } from '@context/user';
import useGetEditorRouter from '@hooks/useGetEditorRouter';
import useToggle from '@hooks/useToggle';
import classed from '@utils/classed';
import 'allotment/dist/style.css';
import clsx from 'clsx';
import { cva } from 'cva';
import {
	BookmarkIcon,
	FilesIcon,
	LucideIcon,
	MessageSquareIcon,
	MessagesSquareIcon,
	ScrollTextIcon,
	SearchIcon,
	SettingsIcon,
	StickyNoteIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
const TabButton = classed.button(
	cva({
		base: 'w-10 h-10 flex justify-center items-center text-gray-400 transition-colors hover:text-isaac dark:text-gray-500 hover:dark:text-isaac rounded-md',
		variants: {
			active: {
				true: 'bg-gray-200  dark:bg-gray-900  text-isaac dark:text-isaac',
			},
		},
	}),
);

const buttons: {
	tab: Panel;
	Icon: LucideIcon;
	ActiveIcon?: LucideIcon;
	disabled?: boolean;
}[] = [
	{ tab: Panel.FILE_EXPLORER, Icon: FilesIcon },
	{ tab: Panel.CHAT, Icon: MessageSquareIcon },
	{ tab: Panel.LITERATURE_SEARCH, Icon: SearchIcon },
	{ tab: Panel.REFERENCES, Icon: BookmarkIcon },
	{ tab: Panel.NOTES, Icon: StickyNoteIcon },
	{ tab: Panel.CHAT_SESSIONS, Icon: MessagesSquareIcon, disabled: false },
	// { tab: Panel.AI_OUTPUT_LOGS, Icon: ScrollTextIcon, disabled: false },
];

const SettingsModal = dynamic(
	() => import('../../components/core/SettingsModal'),
	{
		ssr: false,
	},
);

const CustomInstructionsModal = dynamic(
	() => import('../../components/core/CustomInstructionsModal'),
	{
		ssr: false,
	},
);

const UserMenu = dynamic(() => import('../../components/core/UserMenu'), {
	ssr: false,
});

export default function AppMenuBar() {
	const openPanel = useUIStore(s => s.openPanel);
	const activePanel = useUIStore(s => s.activePanel);
	const { user, logout } = useUser();
	const [isSettingsOpen, openSettings, , , setSettingsOpen] = useToggle();
	const { projectId: activeProjectId } = useGetEditorRouter();
	const customInstructionsModalOpen = useUIStore(
		s => s.customInstructionsModalOpen,
	);
	const setCustomInstructionsModalOpen = useUIStore(
		s => s.setCustomInstructionsModalOpen,
	);
	const handlePanelClick = useCallback(
		tab => {
			if (!activeProjectId) {
				// Show toast message when there is no active project
				toast.error('Please open or create a project first.');
				return;
			}
			openPanel(tab === activePanel ? undefined : tab);
		},
		[activePanel, openPanel, activeProjectId],
	);

	const panelNames = {
		[Panel.FILE_EXPLORER]: 'File Explorer',
		[Panel.CHAT]: 'Chat',
		[Panel.LITERATURE_SEARCH]: 'Literature Search',
		[Panel.REFERENCES]: 'References',
		[Panel.NOTES]: 'Notes',
		[Panel.CHAT_SESSIONS]: 'Chat Sessions',
		// [Panel.AI_OUTPUT_LOGS]: 'AI Output Logs',
	};

	return (
		<div
			className={clsx(
				'p-3 flex flex-col gap-2 bg-white dark:bg-black',
				activePanel && 'border-r',
			)}
		>
			{buttons
				.filter(btn => !btn.disabled)
				.map(btn => {
					const isActive = activePanel === btn.tab;
					return (
						<Tooltip key={btn.tab}>
							<TooltipTrigger asChild>
								<TabButton
									active={isActive}
									onClick={() => handlePanelClick(btn.tab)}
								>
									{isActive && btn.ActiveIcon ? (
										<btn.ActiveIcon size={22} strokeWidth={1.4} />
									) : (
										<btn.Icon size={22} strokeWidth={1.4} />
									)}
								</TabButton>
							</TooltipTrigger>
							<TooltipContent side="right">
								{panelNames[btn.tab]}
							</TooltipContent>
						</Tooltip>
					);
				})}

			<div className="div flex flex-col gap-2 mt-auto">
				<TabButton active={false} onClick={openSettings}>
					<SettingsIcon size={22} strokeWidth={1.4} />
				</TabButton>
				<UserMenu
					email={user?.email}
					logout={logout}
					avatarUrl={user?.user_metadata?.avatar_url ?? ''}
				/>
				<Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
					<SettingsModal />
				</Dialog>
				<Dialog
					open={customInstructionsModalOpen}
					onOpenChange={setCustomInstructionsModalOpen}
				>
					<CustomInstructionsModal />
				</Dialog>
			</div>
		</div>
	);
}