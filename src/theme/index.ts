import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

// カスタムトークンの定義
const tokens = {
  colors: {
    pop: {
      blue: { value: "#4A90E2" },
      green: { value: "#7ED321" },
      orange: { value: "#F5A623" },
      pink: { value: "#FF6B9D" },
      purple: { value: "#9013FE" },
      red: { value: "#FF4757" },
      yellow: { value: "#FFC048" },
      teal: { value: "#00D2D3" },
    },
    soft: {
      blue: { value: "#E3F2FD" },
      green: { value: "#F1F8E9" },
      orange: { value: "#FFF8E1" },
      pink: { value: "#FCE4EC" },
      purple: { value: "#F3E5F5" },
      red: { value: "#FFEBEE" },
      yellow: { value: "#FFFDE7" },
      teal: { value: "#E0F2F1" },
    },
    gradient: {
      primary: { value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
      secondary: { value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
      success: { value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
      warning: { value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    }
  },
  shadows: {
    soft: { value: "0 4px 12px rgba(0, 0, 0, 0.1)" },
    medium: { value: "0 8px 24px rgba(0, 0, 0, 0.12)" },
    large: { value: "0 12px 32px rgba(0, 0, 0, 0.15)" },
    colored: { value: "0 4px 12px rgba(102, 126, 234, 0.25)" },
  },
  radii: {
    card: { value: "16px" },
    button: { value: "12px" },
    input: { value: "8px" },
    large: { value: "24px" },
  },
  fonts: {
    heading: { value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
    body: { value: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  },
};

// レシピの定義
const popCardRecipe = defineRecipe({
  className: "pop-card",
  base: {
    borderRadius: "card",
    boxShadow: "soft",
    bg: "white",
    p: 4,
    transition: "all 0.3s ease",
    _hover: {
      transform: "translateY(-2px)",
      boxShadow: "medium",
    },
  },
  variants: {
    variant: {
      primary: {
        bg: "gradient.primary",
        color: "white",
        boxShadow: "colored",
      },
      secondary: {
        bg: "soft.blue",
        borderLeft: "4px solid",
        borderColor: "pop.blue",
      },
      success: {
        bg: "soft.green",
        borderLeft: "4px solid",
        borderColor: "pop.green",
      },
      warning: {
        bg: "soft.orange",
        borderLeft: "4px solid",
        borderColor: "pop.orange",
      },
    },
  },
});

const popButtonRecipe = defineRecipe({
  className: "pop-button",
  base: {
    borderRadius: "button",
    fontWeight: "600",
    transition: "all 0.2s ease",
    cursor: "pointer",
    _hover: {
      transform: "translateY(-1px)",
      boxShadow: "medium",
    },
    _active: {
      transform: "translateY(0px)",
    },
  },
  variants: {
    variant: {
      primary: {
        bg: "pop.blue",
        color: "white",
        _hover: {
          bg: "#3A7BD5",
        },
      },
      secondary: {
        bg: "soft.blue",
        color: "pop.blue",
        border: "2px solid",
        borderColor: "pop.blue",
        _hover: {
          bg: "pop.blue",
          color: "white",
        },
      },
      ghost: {
        bg: "transparent",
        color: "pop.blue",
        _hover: {
          bg: "soft.blue",
        },
      },
    },
  },
});

const questCardRecipe = defineRecipe({
  className: "quest-card",
  base: {
    display: "flex",
    alignItems: "center",
    p: 3,
    borderRadius: "card",
    boxShadow: "soft",
    bg: "white",
    transition: "all 0.3s ease",
    cursor: "pointer",
    _hover: {
      transform: "translateY(-2px)",
      boxShadow: "medium",
    }
  },
  variants: {
    state: {
      pending: {
        bg: "white",
        borderLeft: "4px solid",
        borderColor: "pop.blue",
      },
      done: {
        bg: "soft.green",
        borderLeft: "4px solid",
        borderColor: "pop.green",
        opacity: 0.8,
        _hover: {
          transform: "none",
          boxShadow: "soft",
        }
      }
    },
    priority: {
      high: {
        borderLeft: "4px solid",
        borderColor: "pop.red",
        bg: "soft.red",
      },
      medium: {
        borderLeft: "4px solid",
        borderColor: "pop.orange",
        bg: "soft.orange",
      },
      low: {
        borderLeft: "4px solid",
        borderColor: "pop.green",
        bg: "soft.green",
      },
    }
  }
});

const questTextRecipe = defineRecipe({
  className: "quest-text",
  base: {
    fontSize: "md",
    fontFamily: "body",
    fontWeight: "500",
    color: "gray.700",
    lineHeight: "1.5",
  },
  variants: {
    state: {
      done: {
        textDecoration: "line-through",
        color: "gray.400",
        opacity: 0.7,
      }
    }
  }
});

const popInputRecipe = defineRecipe({
  className: "pop-input",
  base: {
    bg: "white",
    border: "2px solid",
    borderColor: "gray.200",
    borderRadius: "input",
    boxShadow: "soft",
    fontFamily: "body",
    fontSize: "md",
    p: 3,
    transition: "all 0.2s ease",
    _focus: {
      borderColor: "pop.blue",
      boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
      outline: "none",
    },
    _placeholder: {
      color: "gray.400",
    }
  },
});

// カスタム設定の作成
const config = defineConfig({
  theme: {
    tokens,
    recipes: {
      popCard: popCardRecipe,
      popButton: popButtonRecipe,
      questCard: questCardRecipe,
      questText: questTextRecipe,
      popInput: popInputRecipe,
    }
  }
});

// カスタムシステムの作成
export const system = createSystem(defaultConfig, config);
