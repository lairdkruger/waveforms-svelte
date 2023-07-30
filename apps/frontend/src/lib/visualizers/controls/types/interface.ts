// Control interface types
export interface Folder {
	id: string
	label: string
}

export interface Group {
	id: string
	label: string
	folder: string
}

export interface FolderOptions {
	label: string
}

export interface GroupOptions {
	label: string
	folder: string
}

export interface ControlOptions {
	label: string
	folder: string
	group: string
}
