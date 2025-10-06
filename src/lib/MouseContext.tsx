"use client";
import { useEffect, useState, createContext, useContext } from "react";

type MouseContextType = { x: number; y: number };
const MouseContext = createContext<MouseContextType>({ x: 0.5, y: 0.5 });

export const MouseProvider = ({ children }: { children: React.ReactNode }) => {
	const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

	useEffect(() => {
		const handleMove = (e: MouseEvent) => {
			setMouse({
				x: e.clientX / window.innerWidth,
				y: e.clientY / window.innerHeight,
			});
		};
		window.addEventListener("mousemove", handleMove);
		return () => window.removeEventListener("mousemove", handleMove);
	}, []);

	return (
		<MouseContext.Provider value={mouse}>{children}</MouseContext.Provider>
	);
};

export const useMouse = () => useContext(MouseContext);
