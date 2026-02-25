'use client';
import React from 'react';
import { createButton } from '@gluestack-ui/core/button/creator';
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator';

const SCOPE = 'BUTTON';

const Root = withStyleContext(Pressable, SCOPE);

const UIButton = createButton({
  Root: Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: UIIcon,
});

cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
});

const buttonStyle = tva({
  base: 'group/button rounded bg-content-accent flex-row items-center justify-center data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 data-[disabled=true]:opacity-40 gap-2',
  variants: {
    action: {
      primary:
        'bg-content-accent data-[hover=true]:bg-content-accent/90 data-[active=true]:bg-content-accent/80 border-content-accent data-[hover=true]:border-content-accent data-[active=true]:border-content-accent data-[focus-visible=true]:web:ring-indicator-info',
      secondary:
        'bg-bg-secondary border-border-secondary data-[hover=true]:bg-bg-secondary data-[hover=true]:border-border-secondary data-[active=true]:bg-bg-secondary data-[active=true]:border-border-secondary data-[focus-visible=true]:web:ring-indicator-info',
      positive:
        'bg-content-positive border-content-positive data-[hover=true]:bg-content-positive/90 data-[hover=true]:border-content-positive data-[active=true]:bg-content-positive/80 data-[active=true]:border-content-positive data-[focus-visible=true]:web:ring-indicator-info',
      negative:
        'bg-content-negative border-content-negative data-[hover=true]:bg-content-negative/90 data-[hover=true]:border-content-negative data-[active=true]:bg-content-negative/80 data-[active=true]:border-content-negative data-[focus-visible=true]:web:ring-indicator-info',
      default:
        'bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent',
    },
    variant: {
      link: 'px-0',
      outline:
        'bg-transparent border data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent',
      solid: '',
    },

    size: {
      xs: 'px-3.5 h-8',
      sm: 'px-4 h-9',
      md: 'px-5 h-10',
      lg: 'px-6 h-11',
      xl: 'px-7 h-12',
    },
  },
  compoundVariants: [
    {
      action: 'primary',
      variant: 'link',
      class:
        'px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'secondary',
      variant: 'link',
      class:
        'px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'positive',
      variant: 'link',
      class:
        'px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'negative',
      variant: 'link',
      class:
        'px-0 bg-transparent data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'primary',
      variant: 'outline',
      class:
        'bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent',
    },
    {
      action: 'secondary',
      variant: 'outline',
      class:
        'bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent',
    },
    {
      action: 'positive',
      variant: 'outline',
      class:
        'bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent',
    },
    {
      action: 'negative',
      variant: 'outline',
      class:
        'bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-transparent',
    },
  ],
});

const buttonTextStyle = tva({
  base: 'text-content-inverse font-semibold web:select-none',
  parentVariants: {
    action: {
      primary:
        'text-content-accent data-[hover=true]:text-content-accent data-[active=true]:text-content-accent',
      secondary:
        'text-content-secondary data-[hover=true]:text-content-secondary data-[active=true]:text-content-primary',
      positive:
        'text-content-positive data-[hover=true]:text-content-positive data-[active=true]:text-content-positive',
      negative:
        'text-content-negative data-[hover=true]:text-content-negative data-[active=true]:text-content-negative',
    },
    variant: {
      link: 'data-[hover=true]:underline data-[active=true]:underline',
      outline: '',
      solid:
        'text-content-inverse data-[hover=true]:text-content-inverse data-[active=true]:text-content-inverse',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'primary',
      class:
        'text-content-inverse data-[hover=true]:text-content-inverse data-[active=true]:text-content-inverse',
    },
    {
      variant: 'solid',
      action: 'secondary',
      class:
        'text-content-primary data-[hover=true]:text-content-primary data-[active=true]:text-content-primary',
    },
    {
      variant: 'solid',
      action: 'positive',
      class:
        'text-content-inverse data-[hover=true]:text-content-inverse data-[active=true]:text-content-inverse',
    },
    {
      variant: 'solid',
      action: 'negative',
      class:
        'text-content-inverse data-[hover=true]:text-content-inverse data-[active=true]:text-content-inverse',
    },
    {
      variant: 'outline',
      action: 'primary',
      class:
        'text-content-accent data-[hover=true]:text-content-accent data-[active=true]:text-content-accent',
    },
    {
      variant: 'outline',
      action: 'secondary',
      class:
        'text-content-secondary data-[hover=true]:text-content-accent data-[active=true]:text-content-primary',
    },
    {
      variant: 'outline',
      action: 'positive',
      class:
        'text-content-accent data-[hover=true]:text-content-accent data-[active=true]:text-content-accent',
    },
    {
      variant: 'outline',
      action: 'negative',
      class:
        'text-content-accent data-[hover=true]:text-content-accent data-[active=true]:text-content-accent',
    },
  ],
});

const buttonIconStyle = tva({
  base: 'fill-none',
  parentVariants: {
    variant: {
      link: 'data-[hover=true]:underline data-[active=true]:underline',
      outline: '',
      solid:
        'text-content-inverse data-[hover=true]:text-content-inverse data-[active=true]:text-content-inverse',
    },
    size: {
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-[18px] w-[18px]',
      xl: 'h-5 w-5',
    },
    action: {
      primary:
        'text-content-accent data-[hover=true]:text-content-accent data-[active=true]:text-content-accent',
      secondary:
        'text-content-secondary data-[hover=true]:text-content-secondary data-[active=true]:text-content-primary',
      positive:
        'text-content-positive data-[hover=true]:text-content-positive data-[active=true]:text-content-positive',

      negative:
        'text-content-negative data-[hover=true]:text-content-negative data-[active=true]:text-content-negative',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'primary',
      class:
        'text-content-inverse data-[hover=true]:text-content-inverse data-[active=true]:text-content-inverse',
    },
    {
      variant: 'solid',
      action: 'secondary',
      class:
        'text-content-primary data-[hover=true]:text-content-primary data-[active=true]:text-content-primary',
    },
    {
      variant: 'solid',
      action: 'positive',
      class:
        'text-content-inverse data-[hover=true]:text-content-inverse data-[active=true]:text-content-inverse',
    },
    {
      variant: 'solid',
      action: 'negative',
      class:
        'text-content-inverse data-[hover=true]:text-content-inverse data-[active=true]:text-content-inverse',
    },
  ],
});

const buttonGroupStyle = tva({
  base: '',
  variants: {
    space: {
      'xs': 'gap-1',
      'sm': 'gap-2',
      'md': 'gap-3',
      'lg': 'gap-4',
      'xl': 'gap-5',
      '2xl': 'gap-6',
      '3xl': 'gap-7',
      '4xl': 'gap-8',
    },
    isAttached: {
      true: 'gap-0',
    },
    flexDirection: {
      'row': 'flex-row',
      'column': 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  },
});

type IButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIButton>,
  'context'
> &
  VariantProps<typeof buttonStyle> & { className?: string };

const Button = React.forwardRef<
  React.ElementRef<typeof UIButton>,
  IButtonProps
>(
  (
    { className, variant = 'solid', size = 'md', action = 'primary', ...props },
    ref
  ) => {
    return (
      <UIButton
        ref={ref}
        {...props}
        className={buttonStyle({ variant, size, action, class: className })}
        context={{ variant, size, action }}
      />
    );
  }
);

type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle> & { className?: string };

const ButtonText = React.forwardRef<
  React.ElementRef<typeof UIButton.Text>,
  IButtonTextProps
>(({ className, variant, size, action, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    action: parentAction,
  } = useStyleContext(SCOPE);

  return (
    <UIButton.Text
      ref={ref}
      {...props}
      className={buttonTextStyle({
        parentVariants: {
          variant: parentVariant,
          size: parentSize,
          action: parentAction,
        },
        variant,
        size,
        action,
        class: className,
      })}
    />
  );
});

const ButtonSpinner = UIButton.Spinner;

type IButtonIcon = React.ComponentPropsWithoutRef<typeof UIButton.Icon> &
  VariantProps<typeof buttonIconStyle> & {
    className?: string | undefined;
    as?: React.ElementType;
    height?: number;
    width?: number;
  };

const ButtonIcon = React.forwardRef<
  React.ElementRef<typeof UIButton.Icon>,
  IButtonIcon
>(({ className, size, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    action: parentAction,
  } = useStyleContext(SCOPE);

  if (typeof size === 'number') {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
      />
    );
  }
  return (
    <UIButton.Icon
      {...props}
      className={buttonIconStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
          action: parentAction,
        },
        size,
        class: className,
      })}
      ref={ref}
    />
  );
});

type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof UIButton.Group> &
  VariantProps<typeof buttonGroupStyle>;

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof UIButton.Group>,
  IButtonGroupProps
>(
  (
    {
      className,
      space = 'md',
      isAttached = false,
      flexDirection = 'column',
      ...props
    },
    ref
  ) => {
    return (
      <UIButton.Group
        className={buttonGroupStyle({
          class: className,
          space,
          isAttached,
          flexDirection,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);

Button.displayName = 'Button';
ButtonText.displayName = 'ButtonText';
ButtonSpinner.displayName = 'ButtonSpinner';
ButtonIcon.displayName = 'ButtonIcon';
ButtonGroup.displayName = 'ButtonGroup';

export { Button, ButtonText, ButtonSpinner, ButtonIcon, ButtonGroup };
