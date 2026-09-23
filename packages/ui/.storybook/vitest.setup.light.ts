import { setProjectAnnotations } from "@storybook/react-vite";
import { benchAnnotations, guardTheme } from "./bench";

setProjectAnnotations(benchAnnotations("light"));
guardTheme("light");
