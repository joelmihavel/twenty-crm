import { type ReactNode, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/components';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';

const StyledBoardContainer = styled.div`
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 0;
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledColumn = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  max-height: 100%;
  min-width: 280px;
  width: 280px;
`;

const StyledColumnHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledColumnTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledColumnCount = styled.span`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  padding: 1px 8px;
`;

const StyledColumnCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 40px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled(Link)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: inherit;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
  text-decoration: none;
  transition: box-shadow 0.1s ease;

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
`;

const StyledCardTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCardField = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledEmptyColumn = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

type TagColor = 'green' | 'red' | 'orange' | 'blue' | 'gray';

export type BoardColumn = {
  key: string;
  label: string;
  tagColor: TagColor;
};

export type BoardCardField = {
  label: string;
  value: string | number;
};

export type BoardCardTag = {
  text: string;
  color: TagColor;
};

type HawkeyeBoardViewProps<T> = {
  data: T[];
  columns: BoardColumn[];
  statusKey: keyof T & string;
  idKey: keyof T & string;
  basePath: string;
  titleFn: (record: T) => string;
  cardFields?: (record: T) => BoardCardField[];
  cardTags?: (record: T) => BoardCardTag[];
  renderCardExtra?: (record: T) => ReactNode;
  onStatusChange?: (recordId: string, newStatus: string) => void;
};

export const HawkeyeBoardView = <T,>({
  data,
  columns,
  statusKey,
  idKey,
  basePath,
  titleFn,
  cardFields,
  cardTags,
  renderCardExtra,
  onStatusChange,
}: HawkeyeBoardViewProps<T>) => {
  const [localData, setLocalData] = useState(data);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { draggableId, destination } = result;
      if (!destination) return;

      const newStatus = destination.droppableId;

      setLocalData((prev) =>
        prev.map((record) =>
          String(record[idKey]) === draggableId
            ? ({ ...record, [statusKey]: newStatus } as T)
            : record,
        ),
      );

      onStatusChange?.(draggableId, newStatus);
    },
    [idKey, statusKey, onStatusChange],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <StyledBoardContainer>
        {columns.map((col) => {
          const records = localData.filter(
            (r) => String(r[statusKey]) === col.key,
          );
          return (
            <StyledColumn key={col.key}>
              <StyledColumnHeader>
                <StyledColumnTitle>
                  <Tag color={col.tagColor} text={col.label} />
                </StyledColumnTitle>
                <StyledColumnCount>{records.length}</StyledColumnCount>
              </StyledColumnHeader>
              <Droppable droppableId={col.key}>
                {(provided) => (
                  <StyledColumnCards
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {records.length === 0 ? (
                      <StyledEmptyColumn>No records</StyledEmptyColumn>
                    ) : (
                      records.map((record, index) => (
                        <Draggable
                          key={String(record[idKey])}
                          draggableId={String(record[idKey])}
                          index={index}
                        >
                          {(dragProvided, snapshot) => (
                            <StyledCard
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              to={`${basePath}/${encodeURIComponent(String(record[idKey]))}`}
                              onClick={(e) => {
                                if (snapshot.isDragging) {
                                  e.preventDefault();
                                }
                              }}
                              style={{
                                ...dragProvided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                              }}
                            >
                              <StyledCardTitle>
                                {titleFn(record)}
                              </StyledCardTitle>
                              {cardFields?.(record)?.map((field) => (
                                <StyledCardField key={field.label}>
                                  {field.label}: {field.value}
                                </StyledCardField>
                              ))}
                              {cardTags && (
                                <StyledCardTags>
                                  {cardTags(record).map((tag) => (
                                    <Tag
                                      key={tag.text}
                                      color={tag.color}
                                      text={tag.text}
                                    />
                                  ))}
                                </StyledCardTags>
                              )}
                              {renderCardExtra?.(record)}
                            </StyledCard>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </StyledColumnCards>
                )}
              </Droppable>
            </StyledColumn>
          );
        })}
      </StyledBoardContainer>
    </DragDropContext>
  );
};
