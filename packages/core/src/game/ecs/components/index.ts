import {
	f32,
	u8,
	u16,	
	i32
} from 'bitecs/serialization';

export const Position = { x: f32([]), y: f32([]) };
export const Velocity = {
	value : { x: f32([]), y: f32([]) },
	acceleration : { x: f32([]), y: f32([]) },
	friction : f32([])
};

export const Rotation = { value : f32([]) };

export const Renderable = { texture: u8([]), frame: u16([]) };

export const MapMarker = { x: i32([]), y: i32([]) };

export const PlayerInput = {};
export const ShipControls = {
	acceleration : f32([]),
	rotationSpeed : f32([])
}