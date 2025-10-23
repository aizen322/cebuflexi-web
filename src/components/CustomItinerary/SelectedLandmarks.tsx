import { Landmark } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, X, Clock } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SelectedLandmarksProps {
  selectedLandmarks: Landmark[];
  onReorder: (landmarks: Landmark[]) => void;
  onRemove: (landmark: Landmark) => void;
}

interface SortableLandmarkItemProps {
  landmark: Landmark;
  index: number;
  onRemove: (landmark: Landmark) => void;
}

function SortableLandmarkItem({ landmark, index, onRemove }: SortableLandmarkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: landmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-3 hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Order Number */}
          <div className="flex-shrink-0">
            <Badge className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
              {index + 1}
            </Badge>
          </div>

          {/* Landmark Image */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
            <img
              src={landmark.image}
              alt={landmark.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Landmark Info */}
          <div className="flex-grow min-w-0">
            <h4 className="font-semibold text-sm truncate">{landmark.name}</h4>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>~{landmark.estimatedDuration}min</span>
            </div>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(landmark)}
            className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SelectedLandmarks({
  selectedLandmarks,
  onReorder,
  onRemove,
}: SelectedLandmarksProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedLandmarks.findIndex((l) => l.id === active.id);
      const newIndex = selectedLandmarks.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(selectedLandmarks, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  if (selectedLandmarks.length === 0) {
    return (
      <Card className="bg-gray-50 border-dashed border-2">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-3">
            <GripVertical className="h-12 w-12 mx-auto opacity-50" />
          </div>
          <h3 className="font-semibold text-gray-600 mb-2">No landmarks selected</h3>
          <p className="text-sm text-gray-500">
            Select landmarks above to build your custom itinerary
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">Your Itinerary</h3>
        <p className="text-sm text-gray-600">
          Drag to reorder • {selectedLandmarks.length} stop{selectedLandmarks.length > 1 ? "s" : ""}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={selectedLandmarks.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {selectedLandmarks.map((landmark, index) => (
            <SortableLandmarkItem
              key={landmark.id}
              landmark={landmark}
              index={index}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

