import React from 'react';
import { View } from 'react-native';
import { Card as PaperCard, Text } from 'react-native-paper';

interface CardProps {
  children: React.ReactNode;
  style?: any;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: any;
}

interface CardTitleProps {
  title: string;
  subtitle?: string;
  left?: (props: { size: number }) => React.ReactNode;
  right?: (props: { size: number }) => React.ReactNode;
  style?: any;
}

interface CardActionsProps {
  children: React.ReactNode;
  style?: any;
}

const Card = ({ children, style, ...props }: CardProps) => {
  return (
    <PaperCard style={style} {...props}>
      {children}
    </PaperCard>
  );
};

const CardContent = ({ children, style, ...props }: CardContentProps) => {
  return (
    <PaperCard.Content style={style} {...props}>
      {children}
    </PaperCard.Content>
  );
};

const CardTitle = ({ title, subtitle, left, right, style, ...props }: CardTitleProps) => {
  return (
    <PaperCard.Title 
      title={title}
      subtitle={subtitle}
      left={left}
      right={right}
      style={style}
      {...props}
    />
  );
};

const CardActions = ({ children, style, ...props }: CardActionsProps) => {
  return (
    <PaperCard.Actions style={style} {...props}>
      {children}
    </PaperCard.Actions>
  );
};

// For compatibility with the previous API
const CardHeader = ({ children, style, ...props }: CardContentProps) => {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
};

const CardFooter = CardActions;

export { Card, CardContent, CardTitle, CardHeader, CardActions, CardFooter }; 