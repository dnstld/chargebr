import { setProjectAnnotations } from "@storybook/react-vite";
import { benchAnnotations, guardTheme } from "./bench";

setProjectAnnotations(benchAnnotations("dark"));
guardTheme("dark");
