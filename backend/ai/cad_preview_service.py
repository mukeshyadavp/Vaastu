import os
import uuid
import ezdxf

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend


def generate_dxf_preview(file_path: str, output_folder: str) -> str:
    """
    Converts DXF file into PNG preview image.
    Returns generated PNG filename.
    """

    if not file_path.lower().endswith(".dxf"):
        raise ValueError("Only DXF preview is supported")

    os.makedirs(output_folder, exist_ok=True)

    doc = ezdxf.readfile(file_path)
    modelspace = doc.modelspace()

    preview_filename = f"cad-preview-{uuid.uuid4()}.png"
    preview_path = os.path.join(output_folder, preview_filename)

    fig = plt.figure(figsize=(8, 8), dpi=160)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor("white")
    ax.axis("off")

    context = RenderContext(doc)
    backend = MatplotlibBackend(ax)
    frontend = Frontend(context, backend)

    frontend.draw_layout(modelspace, finalize=True)

    ax.autoscale()
    ax.set_aspect("equal", adjustable="box")

    fig.savefig(
        preview_path,
        dpi=160,
        bbox_inches="tight",
        pad_inches=0.05,
        facecolor="white",
    )

    plt.close(fig)

    return preview_filename